import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import Usuario from '../models/Usuario.js';

// ─── Serialización de sesión ───────────────────────────────────────────────
passport.serializeUser((user, done) => {
    done(null, { id: user.id, proveedor: user.proveedor });
});

passport.deserializeUser(async (data, done) => {
    try {
        const usuario = await Usuario.findByPk(data.id);
        done(null, usuario);
    } catch (error) {
        done(error, null);
    }
});

// ─── Estrategia GOOGLE ─────────────────────────────────────────────────────
passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Buscar si ya existe un usuario con este ID de Google
            let usuario = await Usuario.findOne({
                where: { proveedorId: profile.id, proveedor: 'google' }
            });

            if (!usuario) {
                // Crear nuevo usuario con los datos de Google
                usuario = await Usuario.create({
                    nombre: profile.displayName || profile.username || 'Usuario Google',
                    email: profile.emails?.[0]?.value || `google_${profile.id}@noemail.com`,
                    proveedor: 'google',
                    proveedorId: profile.id,
                    confirmado: true,
                });
            }

            return done(null, usuario);
        } catch (error) {
            return done(error, null);
        }
    }
));

// ─── Estrategia GITHUB ─────────────────────────────────────────────────────
passport.use(new GitHubStrategy(
    {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: '/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Buscar si ya existe un usuario con este ID de GitHub
            let usuario = await Usuario.findOne({
                where: { proveedorId: profile.id, proveedor: 'github' }
            });

            if (!usuario) {
                // Crear nuevo usuario con los datos de GitHub
                usuario = await Usuario.create({
                    nombre: profile.displayName || profile.username || 'Usuario GitHub',
                    email: profile.emails?.[0]?.value || `github_${profile.id}@noemail.com`,
                    proveedor: 'github',
                    proveedorId: String(profile.id),
                    foto: profile.photos?.[0]?.value,
                    confirmado: true,
                });
            }

            return done(null, usuario);
        } catch (error) {
            return done(error, null);
        }
    }
));

export default passport;
