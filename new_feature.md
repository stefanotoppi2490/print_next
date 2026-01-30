CONTESTO ARCHITETTURALE (LEGGERE CON ATTENZIONE)

Questo progetto usa Next.js + TanStack Query.
Lo stato applicativo NON viene gestito con Redux/Zustand/Context manuale.
Tutto lo stato condiviso post-login vive nella cache di TanStack Query.

OBIETTIVO

Implementare il caricamento delle informazioni dell’utente loggato subito dopo il login
usando l’endpoint:

GET /users/api/management/users/{userId}

La risposta rappresenta lo USER ACCOUNT CONTEXT dell’applicazione
(domain, role, email, flags, ecc.)
{
"firstName": "System",
"lastName": "Administrator",
"email": "admin@wolico.com",
"domain": "wtgprint.com",
"role": "p",
"isActive": true,
"lastLoginDate": "2026-01-30T08:23:38.4186671",
"id": "6b2b8c65-5ac7-4791-bcd1-65f71a7f82ef",
"created": "2025-09-24T09:47:24.504252",
"updated": "2026-01-30T08:23:38.4253047",
"delete": null
}
e deve essere:

- caricata UNA SOLA VOLTA post-login
- disponibile globalmente per tutta l’app
- SOLO in lettura (mai modificabile dalla UI)
- automaticamente eliminata al logout

REGOLE ARCHITETTURALI OBBLIGATORIE

1. NON usare React Context manuale
2. NON usare Redux o altri global store
3. NON fare fetch nelle singole pagine (Groups, Roles, ecc.)
4. NON passare questi dati come props
5. NON permettere alla UI di settare o modificare il dominio
6. Il dominio deve essere sempre letto dal contesto utente globale
7. La query deve avere una QUERY KEY STABILE e SEMANTICA
   (es: ['management-user'] o equivalente)

IMPLEMENTAZIONE ATTESA

- Creare una query globale che rappresenti l’utente loggato
- Inizializzare questa query in un punto di bootstrap post-login
  (es: layout principale management o app initializer)
- Tutte le feature (Groups, Roles, Permissions, ecc.)
  devono LEGGERE il dominio e le info account da questa query
- Le query di business (es: groups)
  devono DIPENDERE dal dominio ottenuto dallo user account context
- Al logout, la cache dell’utente deve essere pulita

CASO GROUPS

- La ricerca lavora SOLO sulla lista dei gruppi
- Il dominio NON è configurabile via UI
- Il dominio viene letto dal contesto utente globale
  e usato implicitamente nelle chiamate ai gruppi
