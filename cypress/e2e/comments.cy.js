describe('Comment module', () => {
  const dataCount = 5,
    randomId = Cypress._.random(6, 10),
    deletedCommentId = Cypress._.random(1, dataCount)

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

    it('should return correct comments', () => {
      cy.fixture('comments').then((commentData) => {
        commentData.forEach((comment) => {
          cy.request({
            method: 'POST',
            url: '/comments',
            headers: {
              authorization: `Bearer ${Cypress.env('token')}`,
            },
            body: comment,
          }).then((response) => {
            const {
              success,
              data: { post_id, content },
            } = response.body

            expect(response.status).to.eq(201)
            expect(success).to.be.true
            expect(post_id).to.eq(comment.post_id)
            expect(content).to.eq(comment.content)
          })
        })
      })
    })

    it('should be found in get post by id endpoint', () => {
      cy.fixture('comments').then((commentData) => {
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
      cy.request({
        method: 'GET',
        url: `/posts`,
        headers: {
          authorization: `Bearer ${Cypress.env('token')}`,
        },
      }).then((response) => {
        cy.fixture('comments').then((commentData) => {
          const posts = response.body.data
          commentData.forEach((comment) => {
            const isFound = posts
              .find((post) => post.id === comment.post_id)
              .comments.some((_comment) => _comment.content === comment.content)

            expect(isFound).to.be.ok
          })
        })
      })
    })
  })

  describe('Delete comment', () => {
    it('should return unauthorized', () => {
      cy.checkUnauthorized('DELETE', '/comments/1')
    })

    it('should return not found', () => {
      cy.request({
        method: 'DELETE',
        url: `/comments/${randomId}`,
        headers: {
          authorization: `Bearer ${Cypress.env('token')}`,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404)
      })
    })

    it('should successfully delete comment', () => {
      cy.request({
        method: 'DELETE',
        url: `/comments/${deletedCommentId}`,
        headers: {
          authorization: `Bearer ${Cypress.env('token')}`,
        },
      }).then((response) => {
        const { success, message } = response.body
        expect(response.status).to.be.ok
        expect(success).to.ok
        expect(message).to.eq('Comment deleted successfully')
      })
    })

    it('should not be found in detail post endpoint', () => {
      cy.fixture('comments').then((commentData) => {
        const deletedComment = commentData[deletedCommentId]

        cy.request({
          method: 'GET',
          url: `/posts/${deletedComment.post_id}`,
          headers: {
            authorization: `Bearer ${Cypress.env('token')}`,
          },
        }).then((response) => {
          const { comments } = response.body.data
          const isFound = comments.some(
            (comment) =>
              comment.id === deletedCommentId &&
              comment.content === deletedComment.content,
          )

          expect(isFound).to.be.false
        })
      })
    })
  })
})
