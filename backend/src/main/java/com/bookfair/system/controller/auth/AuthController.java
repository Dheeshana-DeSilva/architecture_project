package com.bookfair.system.controller.auth;

import com.bookfair.system.dto.request.LoginRequest;
import com.bookfair.system.dto.request.SignupRequest;
import com.bookfair.system.dto.response.JwtResponse;
import com.bookfair.system.entity.User;
import com.bookfair.system.repository.UserRepository;
import com.bookfair.system.security.jwt.JwtUtils;
import com.bookfair.system.security.jwt.OidcTokenValidator;
import com.bookfair.system.security.services.UserDetailsImpl;
import com.bookfair.system.service.AuthService;
import com.nimbusds.jwt.JWTClaimsSet;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Handles both local (email+password) login and Auth0 OIDC token exchange.
 *
 * <p>OIDC Flow:
 * <ol>
 *   <li>Frontend authenticates via Auth0 SDK and receives an access token.</li>
 *   <li>Frontend calls POST /api/auth/oidc-signin with { "accessToken": "..." }.</li>
 *   <li>This controller validates the token using Auth0's JWKS endpoint.</li>
 *   <li>If the user doesn't exist locally, they are auto-provisioned.</li>
 *   <li>A local JWT is returned for all subsequent API calls.</li>
 * </ol>
 * </p>
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OidcTokenValidator oidcTokenValidator;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Value("${auth0.default-role:VENDOR}")
    private String defaultOidcRole;

    // ── Local (email + password) ────────────────────────────────────────────

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            return ResponseEntity.ok(authService.authenticateUser(loginRequest));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        try {
            return ResponseEntity.ok(authService.registerUser(signUpRequest));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ── Auth0 OIDC Token Exchange ────────────────────────────────────────

    /**
     * POST /api/auth/oidc-signin
     * Body: { "accessToken": "<Auth0 access token>" }
     *
     * <p>Validates the Auth0 access token, auto-provisions a local user if
     * needed, and returns a standard JwtResponse that the frontend stores in
     * localStorage — identical to a local login response.</p>
     */
    @PostMapping("/oidc-signin")
    public ResponseEntity<?> oidcSignIn(@RequestBody Map<String, String> body) {
        String accessToken = body.get("accessToken");

        if (!StringUtils.hasText(accessToken)) {
            return ResponseEntity.badRequest().body("Missing accessToken in request body.");
        }

        // 1. Validate the Auth0 access token against the JWKS endpoint
        JWTClaimsSet claims = oidcTokenValidator.validateAndParse(accessToken);
        if (claims == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid or expired Auth0 access token.");
        }

        // 2. Extract identity claims from the validated token
        String email = oidcTokenValidator.extractEmail(claims);
        String name  = oidcTokenValidator.extractName(claims, email);

        // 3. Find or auto-provision the local user
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .name(name)
                    .email(email)
                    // Generate a random secure password — user will always login via OIDC
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .role(defaultOidcRole.toUpperCase())
                    .enabled(true)
                    .build();
            return userRepository.save(newUser);
        });

        if (!Boolean.TRUE.equals(user.getEnabled())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Your account has been disabled. Please contact support.");
        }

        // 4. Build a Spring Security authentication object (no password needed — already validated by OIDC)
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        // 5. Generate the app's own JWT for subsequent API calls
        String appJwt = jwtUtils.generateJwtToken(authentication);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .toList();

        return ResponseEntity.ok(new JwtResponse(appJwt, userDetails.getId(), userDetails.getEmail(), roles));
    }
}
