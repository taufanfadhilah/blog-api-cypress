describe('Auth module', () => {
  describe('Register', () => {
    const userData = {
      name: 'John Doe',
      email: 'john@nest.test',
      password: 'Secret_123',
    }

    it('should return error messages for validation', () => {
      cy.request({
        method: 'POST',
        url: '/auth/register',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body.error).to.eq('Bad Request')
        expect('name should not be empty').to.be.oneOf(response.body.message)
        expect('email should not be empty').to.be.oneOf(response.body.message)
        expect('password should not be empty').to.be.oneOf(
          response.body.message,
        )
      })
    })

    it('should return error message for invalid email format', () => {
      cy.request({
        method: 'POST',
        url: '/auth/register',
        body: {
          name: userData.name,
          email: 'invalid @ email',
          password: userData.password,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body.error).to.eq('Bad Request')
        expect('email must be an email').to.be.oneOf(response.body.message)
      })
    })

    it('should return error message for invalid password format', () => {
      cy.request({
        method: 'POST',
        url: '/auth/register',
        body: {
          name: userData.name,
          email: userData.email,
          password: 'invalidformat',
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body.error).to.eq('Bad Request')
        expect('password is not strong enough').to.be.oneOf(
          response.body.message,
        )
      })
    })

    it('should successfully registered', () => {
      cy.resetUsers()
      cy.request({
        method: 'POST',
        url: '/auth/register',
        body: userData,
      }).then((response) => {
        const { id, name, email, password } = response.body.data
        expect(response.status).to.eq(201)
        expect(response.body.success).to.be.true
        expect(id).not.to.be.undefined
        expect(name).to.eq(userData.name)
        expect(email).to.eq(userData.email)
        expect(password).to.be.undefined
      })
    })

    it('should return error because of duplicate email', () => {
      cy.request({
        method: 'POST',
        url: '/auth/register',
        body: userData,
        failOnStatusCode: false,
      }).then((response) => {
        console.log({ response })
        expect(response.status).to.eq(500)
        expect(response.body.success).to.be.false
        expect(response.body.message).to.eq('Email already exists')
      })
    })
  })
})
