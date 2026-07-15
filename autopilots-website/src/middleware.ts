import { defineMiddleware } from "astro:middleware";

// Taalroutes verwijzen naar de Nederlandse productiehomepage totdat volledige,
// juridisch en inhoudelijk gecontroleerde vertalingen beschikbaar zijn.
export const onRequest = defineMiddleware((_context, next) => next());
