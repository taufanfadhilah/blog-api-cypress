describe('Post module', () => {
  const dataCount = 15,
    randomId = Cypress._.random(16, 50)

  before('login', () => {
    cy.login()
  })

  before('generate posts data', () => cy.generatePostsData(dataCount))

  describe('Create post', () => {
    it('should return unauthorized', () => {
      cy.checkUnauthorized('POST', '/posts')
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
      cy.fixture('posts').then((postData) => {
        cy.request({
          method: 'POST',
          url: '/posts',
          headers: {
            authorization: `Bearer ${Cypress.env('token')}`,
          },
          body: postData[0],
        }).then((response) => {
          const {
            success,
            data: { title, content, comments },
          } = response.body

          expect(response.status).to.eq(201)
          expect(success).to.be.true
          expect(title).to.eq(postData[0].title)
          expect(content).to.eq(postData[0].content)
          expect(comments.length).to.eq(0)
        })
      })
    })
  })

  describe('Get all posts', () => {
    it('should return unauthorized', () => {
      cy.checkUnauthorized('GET', '/posts')
    })

    it('should return correct count and data', () => {
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
        expect(data.length).to.eq(dataCount)

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

  describe('Get by ID', () => {
    it('should return unauthorized', () => {
      cy.checkUnauthorized('GET', '/posts/1')
    })

    it('should return correct data', () => {
      cy.fixture('posts').then((data) => {
        data.forEach((post, index) => {
          if (index % 2)
            cy.request({
              method: 'GET',
              url: `/posts/${index + 1}`,
              headers: { authorization: `Bearer ${Cypress.env('token')}` },
            }).then((response) => {
              const { title, content } = response.body.data
              expect(response.status).to.be.ok
              expect(title).to.eq(post.title)
              expect(content).to.eq(post.content)
            })
        })
      })
    })

    it('should return not found', () => {
      cy.request({
        method: 'GET',
        url: `/posts/${randomId}`,
        headers: {
          authorization: `Bearer ${Cypress.env('token')}`,
        },
        failOnStatusCode: false,
      }).then((response) => {
        const { success, data } = response.body
        expect(response.status).to.eq(404)
        expect(success).to.be.false
        expect(data).to.be.null
      })
    })
  })

  describe('Update post', () => {
    it('should return unauthorized', () => {
      cy.checkUnauthorized('PATCH', '/posts/1')
    })

    it('should return not found', () => {
      cy.request({
        method: 'GET',
        url: `/posts/${randomId}`,
        headers: {
          authorization: `Bearer ${Cypress.env('token')}`,
        },
        failOnStatusCode: false,
      }).then((response) => {
        const { success, data } = response.body
        expect(response.status).to.eq(404)
        expect(success).to.be.false
        expect(data).to.be.null
      })
    })

    it('should return error validation messages', () => {
      cy.request({
        method: 'PATCH',
        url: '/posts/1',
        body: { title: false, content: randomId },
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

    it('should return correct updated post', () => {
      const newPost = {
        title: 'updated title',
        content: 'updated content',
      }

      cy.request({
        method: 'PATCH',
        url: '/posts/1',
        headers: {
          authorization: `Bearer ${Cypress.env('token')}`,
        },
        body: newPost,
      }).then((response) => {
        const {
          success,
          data: { title, content },
        } = response.body
        expect(response.status).to.eq(200)
        expect(success).to.be.true
        expect(title).to.eq(newPost.title)
        expect(content).to.eq(newPost.content)
      })

      cy.request({
        method: 'GET',
        url: '/posts/1',
        headers: {
          authorization: `Bearer ${Cypress.env('token')}`,
        },
      }).then((response) => {
        const { title, content } = response.body.data
        expect(title).to.eq(newPost.title)
        expect(content).to.eq(newPost.content)
      })

      cy.request({
        method: 'GET',
        url: '/posts',
        headers: {
          authorization: `Bearer ${Cypress.env('token')}`,
        },
      }).then((response) => {
        const post = response.body.data.find((_post) => _post.id === 1)

        expect(post.title).to.eq(newPost.title)
        expect(post.content).to.eq(newPost.content)
      })
    })
  })

  describe('Delete post', () => {
    it('should return unauthorized', () => {
      cy.checkUnauthorized('DELETE', '/posts/1')
    })

    it('should return not found', () => {
      cy.request({
        method: 'DELETE',
        url: `/posts/${randomId}`,
        headers: {
          authorization: `Bearer ${Cypress.env('token')}`,
        },
        failOnStatusCode: false,
      }).then((response) => {
        const { success, data } = response.body
        expect(response.status).to.eq(404)
        expect(success).to.be.false
        expect(data).to.be.null
      })
    })

    it('should successfully remove the post', () => {
      cy.request({
        method: 'DELETE',
        url: '/posts/1',
        headers: {
          authorization: `Bearer ${Cypress.env('token')}`,
        },
      }).then((response) => {
        const { success, message } = response.body
        expect(response.status).to.be.ok
        expect(success).to.be.ok
        expect(message).to.eq('Post deleted successfully')
      })
    })

    it('should not found the deleted post', () => {
      cy.request({
        method: 'GET',
        url: '/posts/1',
        headers: {
          authorization: `Bearer ${Cypress.env('token')}`,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404)
      })

      cy.request({
        method: 'GET',
        url: '/posts',
        headers: {
          authorization: `Bearer ${Cypress.env('token')}`,
        },
      }).then((response) => {
        const post = response.body.data.find((_post) => _post.id === 1)

        expect(post).to.be.undefined
      })
    })
  })
})
