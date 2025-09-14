--
-- PostgreSQL database cluster dump
--

\restrict zob5UKxYFSodShn54wXbogfcaptP2Vp4eQKzbSmi0JuUyRY0zD7xbbha36GT80K

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE admin;
ALTER ROLE admin WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:TkFVnhrhiC3UOd4l2SLM7g==$Wsn7WljPNAZD1V8jVhb9AgkCsFFOBT1jMcAGK/eq8yE=:o4dM9Gp+WoMuUeSqxQ9FTjocVjZ+XXByvmVEXzCz5H4=';

--
-- User Configurations
--








\unrestrict zob5UKxYFSodShn54wXbogfcaptP2Vp4eQKzbSmi0JuUyRY0zD7xbbha36GT80K

--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

\restrict JJqvWGe7iBlcRiZKPqbLq1tGXnvF5HMbgumG2Qx0llt36Fl2OTsh8hUYXmDiPyj

-- Dumped from database version 16.10 (Debian 16.10-1.pgdg13+1)
-- Dumped by pg_dump version 16.10 (Debian 16.10-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

\unrestrict JJqvWGe7iBlcRiZKPqbLq1tGXnvF5HMbgumG2Qx0llt36Fl2OTsh8hUYXmDiPyj

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

\restrict er6hXwhUOc2mlAEzjahI5W6v2qRXhTteEbiPypbgz0mf7LHotH2OcL3ssFMN2U8

-- Dumped from database version 16.10 (Debian 16.10-1.pgdg13+1)
-- Dumped by pg_dump version 16.10 (Debian 16.10-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

\unrestrict er6hXwhUOc2mlAEzjahI5W6v2qRXhTteEbiPypbgz0mf7LHotH2OcL3ssFMN2U8

--
-- Database "stylistdb" dump
--

--
-- PostgreSQL database dump
--

\restrict 0NNJXXbS9idaL78NB5Dwq6RdaeZ7v1uqt7j7HnMD3UTcZvtjEWZG7lJtst6exgV

-- Dumped from database version 16.10 (Debian 16.10-1.pgdg13+1)
-- Dumped by pg_dump version 16.10 (Debian 16.10-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: stylistdb; Type: DATABASE; Schema: -; Owner: admin
--

CREATE DATABASE stylistdb WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE stylistdb OWNER TO admin;

\unrestrict 0NNJXXbS9idaL78NB5Dwq6RdaeZ7v1uqt7j7HnMD3UTcZvtjEWZG7lJtst6exgV
\connect stylistdb
\restrict 0NNJXXbS9idaL78NB5Dwq6RdaeZ7v1uqt7j7HnMD3UTcZvtjEWZG7lJtst6exgV

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL
);


ALTER TABLE public.users OWNER TO admin;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO admin;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.users (id, email, password) FROM stdin;
1	testuser@example.com	$2b$12$Xj/MLoGIkCYd8CbYfrpisuaIXjQ7a/oUWcb1/CroptZTSNEHB4e1K
2	sothingshimrah@gmail.com	$2b$12$WDsbeSIp9yeiWe9joYBqcuGywiwMk9ln5kw2iUbQJ6qzvOsqtQXSK
3	test_1efa92@example.com	$2b$12$eeEniqYppOM2O6hz02PEMeXdbecuEGh7PL9JPZ8kVtN.t6SR6clgi
4	test_a66891@example.com	$2b$12$VU3iJB6xr0P8F4S/coXaQO7/I2Dg2zyBrR7UeF9OX0cyVBZYSaEo6
5	test_e176cc@example.com	$2b$12$O4lhsPm8zAay36Rp1Y20Ne3TCEgug53QEuSMOH8.KtsujQuonUf7a
6	test_753546@example.com	$2b$12$A5uG9XS6gPD1b0ewWkx2D.cVBmjdLhskO4VHIb1PyObVUBDUlvRmG
7	test_af7a76@example.com	$2b$12$X4F.7oZJKfvvVWSIRt655..QOVD8X3LzjkXUpyNE8m22lxbz99676
8	test_42a7c8@example.com	$2b$12$jlCgTg.P552KoGVTdRvg7uV6TOz/EkW.VJTMve1Kssm45DhwnQSvi
9	test_5cba8e@example.com	$2b$12$y9Fpb1kUC2b8biKgVm.mMOcXh5TJClijQU6pcLkGE52sxJ3c2sLxi
10	test_dd20d0@example.com	$2b$12$VPubjj3xYJ9Heb3zVUVAI.b/pjO1LHBa8iabx9hOJq0lW46mjUg3O
11	test_7cdec8@example.com	$2b$12$0zQl2on/6c/vXuqAvMz5VeOZha5DhZ/A5R4p0/70Tzpn2uW.dvG.W
12	test_b45e9c@example.com	$2b$12$qqjBHJxh.n58h18oKhaSDud5wDWr4kwYm4PGgHOoFJSHJ/CPhVlvW
13	test_64d08c@example.com	$2b$12$/k1u2c3QYvHiBxiX/612w.j4DYaTtTgCojYoqgN0zF2JOWXQoUJqe
14	test_4e2db2@example.com	$2b$12$5nV9BJkqQ6elwiQG4wgFS.vO7KItNdzj9XGy9hfJtn535PYJkV3wS
15	test_7ec54d@example.com	$2b$12$iq.Kcss4MOEjmxolueJOHu4LEYg/Ra7pq1ur8RTkoB/VgFJ6deIVC
\.


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.users_id_seq', 15, true);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict 0NNJXXbS9idaL78NB5Dwq6RdaeZ7v1uqt7j7HnMD3UTcZvtjEWZG7lJtst6exgV

--
-- PostgreSQL database cluster dump complete
--

