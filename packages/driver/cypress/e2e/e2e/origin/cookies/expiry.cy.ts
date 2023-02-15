/**
   * FIXES:
   * https://github.com/cypress-io/cypress/issues/25205 (cookies set with expired time with value deleted show up as set with value deleted)
   * https://github.com/cypress-io/cypress/issues/25495 (session cookies set with expired time with value deleted show up as set with value deleted)
   * https://github.com/cypress-io/cypress/issues/25148 (cannot log into azure, shows cookies are disabled/blocked)
   */
describe('Cookies Expiration Tests', { browser: '!webkit' }, () => {
  before(() => {
    cy.origin(`https://app.foobar.com:3503`, () => {
      window.makeRequest = Cypress.require('../../../../support/utils').makeRequestForCookieBehaviorTests
    })
  })

  describe('removes cookies that are set with an expired expiry time from the server side cookie jar / browser via CDP', () => {
    it('works with Max-Age=0', () => {
      cy.visit(`https://www.foobar.com:3502/fixtures/primary-origin.html`)

      cy.visit(`https://app.foobar.com:3503/fixtures/secondary-origin.html`)
      cy.origin(`https://app.foobar.com:3503`, () => {
        cy.window().then((win) => {
          return cy.wrap(window.makeRequest(win, `/set-cookie?cookie=foo=bar; Domain=.foobar.com;`))
        })

        cy.getCookie('foo').its('value').should('eq', 'bar')

        cy.window().then((win) => {
          return cy.wrap(window.makeRequest(win, `/set-cookie?cookie=foo=deleted; Domain=.foobar.com; Max-Age=0;`))
        })

        cy.getCookie('foo').should('eq', null)
      })
    })

    it('works with expires=Thu, 01-Jan-1970 00:00:01 GMT', () => {
      cy.visit(`https://www.foobar.com:3502/fixtures/primary-origin.html`)

      cy.visit(`https://app.foobar.com:3503/fixtures/secondary-origin.html`)
      cy.origin(`https://app.foobar.com:3503`, () => {
        cy.window().then((win) => {
          return cy.wrap(window.makeRequest(win, `/set-cookie?cookie=foo=bar; Domain=.foobar.com;`))
        })

        cy.getCookie('foo').its('value').should('eq', 'bar')

        cy.window().then((win) => {
          return cy.wrap(window.makeRequest(win, `/set-cookie?cookie=foo=deleted; Domain=.foobar.com; expires=Thu, 01-Jan-1970 00:00:01 GMT;`))
        })

        cy.getCookie('foo').should('eq', null)
      })
    })

    it('works with expires=Tues, 01-Jan-1980 00:00:01 GMT', () => {
      cy.visit(`https://www.foobar.com:3502/fixtures/primary-origin.html`)

      cy.visit(`https://app.foobar.com:3503/fixtures/secondary-origin.html`)
      cy.origin(`https://app.foobar.com:3503`, () => {
        cy.window().then((win) => {
          return cy.wrap(window.makeRequest(win, `/set-cookie?cookie=foo=bar; Domain=.foobar.com;`))
        })

        cy.getCookie('foo').its('value').should('eq', 'bar')

        cy.window().then((win) => {
          return cy.wrap(window.makeRequest(win, `/set-cookie?cookie=foo=deleted; Domain=.foobar.com; expires=Tues, 01-Jan-1980 00:00:01 GMT; Max-Age=0;`))
        })

        cy.getCookie('foo').should('eq', null)
      })
    })

    it('work with expires=Thu, 01-Jan-1970 00:00:01 GMT and Max-Age=0', () => {
      cy.visit(`https://www.foobar.com:3502/fixtures/primary-origin.html`)

      cy.visit(`https://app.foobar.com:3503/fixtures/secondary-origin.html`)
      cy.origin(`https://app.foobar.com:3503`, () => {
        cy.window().then((win) => {
          return cy.wrap(window.makeRequest(win, `/set-cookie?cookie=foo=bar; Domain=.foobar.com;`))
        })

        cy.getCookie('foo').its('value').should('eq', 'bar')

        cy.window().then((win) => {
          return cy.wrap(window.makeRequest(win, `/set-cookie?cookie=foo=deleted; Domain=.foobar.com; expires=Thu, 01-Jan-1970 00:00:01 GMT; Max-Age=0;`))
        })

        cy.getCookie('foo').should('eq', null)
      })
    })
  })

  describe('removes cookies that are set with an expired expiry time from the document.cookie patch / browser via CDP', () => {
    it('works with Max-Age=0', () => {
      cy.visit(`https://www.foobar.com:3502/fixtures/primary-origin.html`)

      cy.visit(`https://app.foobar.com:3503/fixtures/secondary-origin.html`)
      cy.origin(`https://app.foobar.com:3503`, () => {
        cy.window().then((win) => {
          win.document.cookie = 'foo=bar'
        })

        cy.getCookie('foo').its('value').should('eq', 'bar')

        cy.window().then((win) => {
          win.document.cookie = 'foo=deleted; expires=Thu, 01-Jan-1970 00:00:01 GMT; Max-Age=0;'
        })

        cy.getCookie('foo').should('eq', null)
      })
    })

    it('works with expires=Thu, 01-Jan-1970 00:00:01 GMT', () => {
      cy.visit(`https://www.foobar.com:3502/fixtures/primary-origin.html`)

      cy.visit(`https://app.foobar.com:3503/fixtures/secondary-origin.html`)
      cy.origin(`https://app.foobar.com:3503`, () => {
        cy.window().then((win) => {
          win.document.cookie = 'foo=bar'
        })

        cy.getCookie('foo').its('value').should('eq', 'bar')

        cy.window().then((win) => {
          win.document.cookie = 'foo=deleted; Max-Age=0'
        })

        cy.getCookie('foo').should('eq', null)
      })
    })

    it('works with expires=Tues, 01-Jan-1980 00:00:01 GMT', () => {
      cy.visit(`https://www.foobar.com:3502/fixtures/primary-origin.html`)

      cy.visit(`https://app.foobar.com:3503/fixtures/secondary-origin.html`)
      cy.origin(`https://app.foobar.com:3503`, () => {
        cy.window().then((win) => {
          win.document.cookie = 'foo=bar'
        })

        cy.getCookie('foo').its('value').should('eq', 'bar')

        cy.window().then((win) => {
          win.document.cookie = 'foo=deleted; expires=Tues, 01-Jan-1980 00:00:01 GMT'
        })

        cy.getCookie('foo').should('eq', null)
      })
    })

    it('expires=Thu, 01-Jan-1970 00:00:01 GMT; Max-Age=0', () => {
      cy.visit(`https://www.foobar.com:3502/fixtures/primary-origin.html`)

      cy.visit(`https://app.foobar.com:3503/fixtures/secondary-origin.html`)
      cy.origin(`https://app.foobar.com:3503`, () => {
        cy.window().then((win) => {
          win.document.cookie = 'foo=bar'
        })

        cy.getCookie('foo').its('value').should('eq', 'bar')

        cy.window().then((win) => {
          win.document.cookie = 'foo=deleted; expires=Thu, 01-Jan-1970 00:00:01 GMT; Max-Age=0'
        })

        cy.getCookie('foo').should('eq', null)
      })
    })
  })
})
