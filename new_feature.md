Obiettivo: creare la pagina groups per gestire i gruppi utenti nella sua interezza(creazione, eliminazioine, assegnazioni utenti ecc).

Sono da implementare le seguenti API:

/users/api/UserGroup => POST

body:

{
"name": "Nome Gruppo",
"description": "Descrizione del gruppo",
"domain": "example.com",
"customerId": null
}

response:

{
"id": "57ebd134-b646-4148-b782-b5747cf03d12",
"name": "Nome Gruppo 11",
"description": "Descrizione del gruppo",
"domain": "example.com",
"customerId": null,
"createdBy": "6b2b8c65-5ac7-4791-bcd1-65f71a7f82ef",
"created": "2026-01-30T05:05:57.2754305Z",
"updated": "2026-01-30T05:05:57.2754313Z",
"isDomainUsersGroup": false
}

/users/api/UserGroup?domain={{domain}} => GET

response:

[
{
"id": "40f13a7e-3c39-4cb8-ae07-00b160781919",
"name": "Domain Users",
"description": "Gruppo speciale che include tutti gli utenti del dominio",
"domain": "wtgprint.com",
"customerId": null,
"createdBy": "6b2b8c65-5ac7-4791-bcd1-65f71a7f82ef",
"created": "2026-01-21T22:15:54.55",
"updated": "2026-01-21T22:15:54.55",
"isDomainUsersGroup": true
},
{
"id": "67038fa1-a302-40ef-ae2f-14eade56bd87",
"name": "Nome Gruppo Aggiornato 1",
"description": "Nuova descrizione",
"domain": "wtgprint.com",
"customerId": null,
"createdBy": "6b2b8c65-5ac7-4791-bcd1-65f71a7f82ef",
"created": "2026-01-23T08:54:56.5798332",
"updated": "2026-01-23T09:24:39.1982652",
"isDomainUsersGroup": false
}
]

/users/api/UserGroup/{{groupId}} => GET

response:

{
"id": "57ebd134-b646-4148-b782-b5747cf03d12",
"name": "Nome Gruppo 11",
"description": "Descrizione del gruppo",
"domain": "example.com",
"customerId": null,
"createdBy": "6b2b8c65-5ac7-4791-bcd1-65f71a7f82ef",
"created": "2026-01-30T05:05:57.2754305",
"updated": "2026-01-30T05:05:57.2754313",
"isDomainUsersGroup": false
}

/users/api/UserGroup/{{groupId}} => PUT

body:

{
"name": "Nome Gruppo Aggiornato",
"description": "Nuova descrizione"
}

response:

{
"id": "57ebd134-b646-4148-b782-b5747cf03d12",
"name": "Nome Gruppo Aggiornato",
"description": "Nuova descrizione",
"domain": "example.com",
"customerId": null,
"createdBy": "6b2b8c65-5ac7-4791-bcd1-65f71a7f82ef",
"created": "2026-01-30T05:05:57.2754305",
"updated": "2026-01-30T05:10:48.2776228Z",
"isDomainUsersGroup": false
}

/users/api/UserGroup/{{groupId}} => DELETE

response: 204 if ok

/users/api/UserGroup/{{groupId}}/members => POST

body:

{
"userId": "{{userId}}"
}

response:

{
"message": "Membro aggiunto con successo"
}

/users/api/UserGroup/{{groupId}}/members/{{userId}} => DELETE

response: 204 if ok

/users/api/UserGroup/{{groupId}}/members => GET

response:

[
{
"id": "6bccb61a-5428-44c2-9c28-f9bcf90ee735",
"userGroupId": "67038fa1-a302-40ef-ae2f-14eade56bd87",
"printUserId": "c7723936-239c-4ba4-ac79-478dd9f5a0ad",
"user": {
"userId": "c7723936-239c-4ba4-ac79-478dd9f5a0ad",
"firstName": "Carlo",
"lastName": "Bertelli",
"email": "carlo.bertelli@wolico.com"
},
"created": "2026-01-23T09:32:33.2895398"
},
{
"id": "ace235bc-3521-435e-a8ff-4180cf5c98b3",
"userGroupId": "67038fa1-a302-40ef-ae2f-14eade56bd87",
"printUserId": "0e5a740c-024c-4543-8483-f459a4917ba0",
"user": {
"userId": "0e5a740c-024c-4543-8483-f459a4917ba0",
"firstName": "Diego",
"lastName": "Dorola",
"email": "diego.dorola@amdigitallife.it"
},
"created": "2026-01-23T09:32:35.4856053"
},
{
"id": "2a13ba05-ed96-4987-8549-7a65955cf615",
"userGroupId": "67038fa1-a302-40ef-ae2f-14eade56bd87",
"printUserId": "15cd573e-9ee6-4f15-b1d6-1e590abc7510",
"user": {
"userId": "15cd573e-9ee6-4f15-b1d6-1e590abc7510",
"firstName": "Gabriele",
"lastName": "Pini",
"email": "gabriele.pini1993@gmail.com"
},
"created": "2026-01-23T09:32:57.9400283"
}
]

Come deve venire:

- Deve essere una tabella che riporta i gruppi creati, in questo caso senza paginazione per ora.
- per ogni riga avrò un tasto members, per gestire i membri associati un tasto edit per modificare il gruppo o un tasto elimina per eliminare il gruppo.
- cliccando il tasto members si aprirà un popup dove avrò la lista degli utenti con un local search in alto
- per ogni utente avrò o il tasto aggiungi o il tasto elimina a seconda che l'utente sia gia o meno nel gruppo, che esegue l'operazione in realtime senza uscire da popup.
- nel caso di modifica del gruppo, uscirà sempre popup con relativo form.
- il tasto per aggiungere un gruppo è sopra la tabella principale e anche questo farà comparire un popup con relativo form
- il tasto elimina deve chiedere conferma prima di procedere all'eliminazione del gruppo.
