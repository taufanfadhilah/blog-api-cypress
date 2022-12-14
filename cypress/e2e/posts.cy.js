describe('Post module', () => {
  const postData = {
    title: 'Title for testing post',
    content: 'lorem ipsum testing post',
  }

  describe('Create post', () => {
    before('login', () => {
      cy.login()
    })

    it('should return unauthorized', () => {
      cy.request({
        method: 'POST',
        url: '/posts',
        failOnStatusCode: false,
      }).then((response) => {
        cy.unauthorized(response)
      })
    })

    it('should return error validation messages', () => {
      cy.request({
        method: 'POST',
        url: '/posts',
        headers: {
          authorization: `Bearer ${Cypress.env('token')}`,
        },
        failOnStatusCode: false,
      }).then((response) => {
        cy.badRequest(response, [
          'title must be a string',
          'content must be a string',
        ])
      })
    })

    it('should return correct post', () => {
      cy.request({
        method: 'POST',
        url: '/posts',
        headers: {
          authorization: `Bearer ${Cypress.env('token')}`,
        },
        body: postData,
      }).then((response) => {
        const {
          success,
          data: { title, content, comments },
        } = response.body
        expect(response.status).to.eq(201)
        expect(success).to.be.true
        expect(title).to.eq(postData.title)
        expect(content).to.eq(postData.content)
        expect(comments.length).to.eq(0)
      })
    })
  })
})
