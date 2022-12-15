describe('Comment module', () => {
  const dataCount = 5,
    randomId = Cypress._.random(1, 15)

  before('do login', () => cy.login())
  before('generate comments', () => cy.generateCommentsData(dataCount))

  describe('Create comment', () => {
    it('should return unauthorized', () => {
      cy.checkUnauthorized('POST', '/comments')
    })

    it('should return error validation messages', () => {
      cy.request({
        method: 'POST',
        url: '/comments',
        headers: {
          authorization: `Bearer ${Cypress.env('token')}`,
        },
        failOnStatusCode: false,
      }).then((response) => {
        cy.badRequest(response, [
          'post_id must be a number conforming to the specified constraints',
          'content must be a string',
        ])
      })
    })

    it('should return correct comment', () => {
      cy.fixture('comments').as('getCommentData')
      cy.get('@getCommentData').then((commentData) => {
        cy.request({
          method: 'POST',
          url: '/comments',
          headers: {
            authorization: `Bearer ${Cypress.env('token')}`,
          },
          body: commentData[0],
        }).then((response) => {
          const {
            success,
            data: { post_id, content },
          } = response.body

          expect(response.status).to.eq(201)
          expect(success).to.be.true
          expect(post_id).to.eq(commentData[0].post_id)
          expect(content).to.eq(commentData[0].content)
        })
      })
    })

    it('should be found in get post by id endpoint', () => {
      cy.fixture('comments').as('getCommentData')
      cy.get('@getCommentData').then((commentData) => {
        cy.request({
          method: 'GET',
          url: `/posts/${commentData[0].post_id}`,
          headers: {
            authorization: `Bearer ${Cypress.env('token')}`,
          },
        }).then((response) => {
          const { comments } = response.body.data
          const isFound = comments.some(
            (comment) => comment.content === commentData[0].content,
          )

          expect(comments).to.be.ok
          expect(isFound).to.be.ok
        })
      })
    })

    it('should be found in get all posts endpoint', () => {
      cy.fixture('comments').as('getCommentData')

      cy.request({
        method: 'GET',
        url: `/posts`,
        headers: {
          authorization: `Bearer ${Cypress.env('token')}`,
        },
      }).then((response) => {
        cy.get('@getCommentData').then((commentData) => {
          const posts = response.body.data
          commentData.forEach((comment) => {
            const isFound = posts
              .find((post) => post.id === comment.post_id)
              .comments.some((comment) => comment.content === comment.content)

            expect(isFound).to.be.ok
          })
        })
      })
    })
  })
})
