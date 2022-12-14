// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('resetUsers', () => {
  cy.request('DELETE', '/auth/reset')
})

Cypress.Commands.add('login', () => {
  const userData = {
    name: 'John Doe',
    email: 'john@nest.test',
    password: 'Secret_123',
  }
  cy.resetUsers()

  cy.request({
    method: 'POST',
    url: '/auth/register',
    body: userData,
  })

  cy.request({
    method: 'POST',
    url: '/auth/login',
    body: {
      email: userData.email,
      password: userData.password,
    },
  }).then((response) => {
    Cypress.env('token', response.body.data.access_token)
  })
})
