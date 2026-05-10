\set ON_ERROR_STOP on

-- ====== Usuario de pruebas (cámbialo aquí una sola vez) ======
\set email 'genaropruebas@mail.com'

\echo ''
\echo '=== Kelom: pruebas wedding_profiles para el usuario ==='
\echo 'Email:' :'email'
\echo ''

-- Buscar UUID del usuario y guardarlo como variable :user_id
SELECT id AS user_id
FROM public.users
WHERE email = lower(:'email')
LIMIT 1
\gset

-- Si no existe, corta
\if :{?user_id}
  \echo 'OK -> user_id:' :user_id
\else
  \echo 'ERROR -> No existe un usuario con el email:' :'email'
  \echo 'Crea el usuario primero (POST /users) y vuelve a correr este script.'
  \quit 1
\endif

\echo ''
\echo '--- 1) Triggers en wedding_profiles ---'
SELECT tgname
FROM pg_trigger
WHERE tgrelid = 'public.wedding_profiles'::regclass
  AND NOT tgisinternal;

\echo ''
\echo '--- 2) BEFORE (crear perfil si no existe + ver timestamps) ---'
INSERT INTO public.wedding_profiles (user_id, city)
VALUES (:'user_id', 'CDMX')
ON CONFLICT (user_id) DO NOTHING;

SELECT 'BEFORE' AS step, user_id, city, created_at, updated_at
FROM public.wedding_profiles
WHERE user_id = :'user_id';

\echo ''
\echo '--- 3) UPDATE ciudad ---'
UPDATE public.wedding_profiles
SET city = 'Guadalajara'
WHERE user_id = :'user_id';

\echo ''
\echo '--- 4) AFTER (updated_at debe cambiar) ---'
SELECT 'AFTER' AS step, user_id, city, created_at, updated_at
FROM public.wedding_profiles
WHERE user_id = :'user_id';
