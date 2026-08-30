package com.bookfair.system.security.jwt;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.JWSKeySelector;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URL;
import java.util.Map;

/**
 * Validates Auth0-issued OIDC access tokens by verifying their signature
 * against Auth0's public JWKS endpoint and checking standard claims.
 *
 * <p>Flow: Frontend sends Auth0 access token → backend calls this validator
 * → if valid, extracts sub/email/name claims → auto-provisions user → returns
 * the app's own JWT for subsequent API calls.</p>
 */
@Component
@Slf4j
public class OidcTokenValidator {

    @Value("${auth0.jwks-uri}")
    private String jwksUri;

    @Value("${auth0.issuer}")
    private String issuer;

    /**
     * Validates the given Auth0 access token and returns its claims if valid.
     *
     * @param accessToken the raw Bearer token string from Auth0
     * @return parsed JWT claims, or null if validation fails
     */
    public JWTClaimsSet validateAndParse(String accessToken) {
        try {
            // Build a JWT processor that verifies RS256 tokens using Auth0's JWKS
            ConfigurableJWTProcessor<SecurityContext> jwtProcessor = new DefaultJWTProcessor<>();
            JWKSource<SecurityContext> jwkSource = new RemoteJWKSet<>(new URL(jwksUri));
            JWSKeySelector<SecurityContext> keySelector =
                    new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, jwkSource);
            jwtProcessor.setJWSKeySelector(keySelector);

            JWTClaimsSet claims = jwtProcessor.process(accessToken, null);

            // Verify the issuer matches the configured Auth0 issuer
            if (!issuer.equals(claims.getIssuer())) {
                log.warn("OIDC token issuer mismatch. Expected: {}, Got: {}", issuer, claims.getIssuer());
                return null;
            }

            // Verify token has not expired (Nimbus does this automatically, but log clearly)
            log.debug("OIDC token validated for subject: {}", claims.getSubject());
            return claims;

        } catch (Exception e) {
            log.error("OIDC token validation failed: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extracts the email from Auth0 token claims.
     * Auth0 places email in the "email" claim (or custom namespace depending on Auth0 rules).
     * Falls back to the subject (sub) claim.
     */
    public String extractEmail(JWTClaimsSet claims) {
        try {
            // Try "email" claim first (requires email scope in Auth0 and proper OIDC mappings)
            String email = (String) claims.getClaim("email");
            if (email != null && !email.isBlank()) return email;

            // Final fallback: use the subject (sub) claim
            return claims.getSubject();
        } catch (Exception e) {
            return claims.getSubject();
        }
    }

    /**
     * Extracts the display name from Auth0 token claims.
     * Tries "name", "given_name", then falls back to email prefix.
     */
    public String extractName(JWTClaimsSet claims, String email) {
        try {
            Map<String, Object> allClaims = claims.toJSONObject();
            for (String key : new String[]{"name", "given_name", "display_name"}) {
                Object val = allClaims.get(key);
                if (val instanceof String s && !s.isBlank()) return s;
            }
        } catch (Exception ignored) { }
        // Fall back to the part before "@" in the email
        return email.contains("@") ? email.split("@")[0] : email;
    }
}
