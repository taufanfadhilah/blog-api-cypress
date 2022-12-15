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

  describe('Get all posts', () => {
    before('login', () => {
      cy.login()
    })

    it('should return unauthorized', () => {
      cy.request({
        method: 'GET',
        url: '/posts',
        failOnStatusCode: false,
      }).then((response) => {
        cy.unauthorized(response)
      })
    })

    it('should return correct count and data', () => {
      const count = 15
      cy.generatePostsData(count)
      cy.fixture('posts').as('getPostData')
      cy.get('@getPostData').then((postData) => cy.createPosts(postData))

      cy.request({
        method: 'GET',
        url: '/posts',
        headers: {
          authorization: `Bearer ${Cypress.env('token')}`,
        },
        failOnStatusCode: false,
      }).then((response) => {
        const { success, data } = response.body
        expect(response.status).to.eq(200)
        expect(success).to.true
        expect(data.length).to.eq(count)

        cy.get('@getPostData').then((postData) => {
          data.forEach((post, index) => {
            expect(post.id).to.eq(index + 1)
            expect(post.title).to.eq(postData[index].title)
            expect(post.content).to.eq(postData[index].content)
          })
        })
      })
    })
  })
})
