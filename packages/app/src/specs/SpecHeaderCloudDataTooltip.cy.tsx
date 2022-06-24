import { SpecHeaderCloudDataTooltipFragmentDoc } from '../generated/graphql-test'
import SpecHeaderCloudDataTooltip from './SpecHeaderCloudDataTooltip.vue'
import { get, set } from 'lodash'
import { defaultMessages } from '@cy/i18n'

describe('SpecHeaderCloudDataTooltip', () => {
  function mountWithStatus (
    status: 'NOT_FOUND' | 'LOGGED_OUT' | 'CONNECTED' | 'NOT_CONNECTED' | 'UNAUTHORIZED' | 'ACCESS_REQUESTED',
    msgKeys: {
      header: string
      connected: string
      notConnected: string
      noAccess: string
      docs: string
    },
  ) {
    cy.mountFragment(SpecHeaderCloudDataTooltipFragmentDoc, {
      onResult: (ctx) => {
        set(ctx, 'cloudViewer', { __typename: 'CloudUser', id: 'abc123' })

        switch (status) {
          case 'LOGGED_OUT':
            set(ctx, 'cloudViewer', null)
            break
          case 'NOT_CONNECTED':
            set(ctx, 'currentProject.cloudProject.__typename', null)
            break
          case 'NOT_FOUND':
            set(ctx, 'currentProject.cloudProject.__typename', 'CloudProjectNotFound')
            break
          case 'ACCESS_REQUESTED':
            set(ctx, 'currentProject.cloudProject.__typename', 'CloudProjectUnauthorized')
            set(ctx, 'currentProject.cloudProject.hasRequestedAccess', true)
            break
          case 'UNAUTHORIZED':
            set(ctx, 'currentProject.cloudProject.__typename', 'CloudProjectUnauthorized')
            break
          case 'CONNECTED':
          default:
            set(ctx, 'currentProject.cloudProject.__typename', 'CloudProjectSpec')
            break
        }
      },
      render: (gql) => {
        const showLoginSpy = cy.spy().as('showLoginSpy')
        const showConnectToProjectSpy = cy.spy().as('showConnectToProjectSpy')

        return (
          <div class="flex justify-around">
            <SpecHeaderCloudDataTooltip
              gql={gql}
              headerTextKeyPath={msgKeys.header}
              connectedTextKeyPath={msgKeys.connected}
              notConnectedTextKeyPath={msgKeys.notConnected}
              noAccessTextKeyPath={msgKeys.noAccess}
              docsTextKeyPath={msgKeys.docs}
              docsUrl="https://dummy.cypress.io/specs-latest-runs?utm_medium=Specs+Latest+Runs+Tooltip&utm_campaign=Latest+Runs"
              data-cy="latest-runs-header"
              onShowLogin={showLoginSpy}
              onShowConnectToProject={showConnectToProjectSpy}
            />
          </div>)
      },
    })
  }

  [{
    contextName: 'Average Duration',
    msgKeys: {
      header: 'specPage.averageDuration.header',
      connected: 'specPage.averageDuration.tooltip.connected',
      notConnected: 'specPage.averageDuration.tooltip.notConnected',
      noAccess: 'specPage.averageDuration.tooltip.noAccess',
      docs: 'specPage.averageDuration.tooltip.linkText',
    },
  }, {
    contextName: 'Latest Runs',
    msgKeys: {
      header: 'specPage.latestRuns.header',
      connected: 'specPage.latestRuns.tooltip.connected',
      notConnected: 'specPage.latestRuns.tooltip.notConnected',
      noAccess: 'specPage.latestRuns.tooltip.noAccess',
      docs: 'specPage.latestRuns.tooltip.linkText',
    },
  }].forEach(({ contextName, msgKeys }) => {
    context(contextName, () => {
      context('connected', () => {
        beforeEach(() => {
          mountWithStatus('CONNECTED', msgKeys)
        })

        it('should render expected tooltip content', () => {
          cy.get('.v-popper').trigger('mouseenter')

          cy.findByTestId('cloud-data-tooltip-content')
          .should('be.visible')
          .and('contain', get(defaultMessages, msgKeys.connected).replace('{0}', get(defaultMessages, msgKeys.docs)))

          cy.get('button').should('not.exist')

          cy.percySnapshot()
        })
      })

      context('not connected', () => {
        beforeEach(() => {
          mountWithStatus('NOT_CONNECTED', msgKeys)
        })

        it('should render expected tooltip content', () => {
          cy.get('.v-popper').trigger('mouseenter')

          cy.findByTestId('cloud-data-tooltip-content')
          .should('be.visible')
          .and('contain', get(defaultMessages, msgKeys.notConnected).replace('{0}', get(defaultMessages, msgKeys.docs)))

          cy.findByTestId('connect-button')
          .should('be.visible')
          .click()

          cy.get('@showConnectToProjectSpy').should('have.been.calledOnce')

          cy.percySnapshot()
        })
      })

      context('unauthorized', () => {
        beforeEach(() => {
          mountWithStatus('UNAUTHORIZED', msgKeys)
        })

        it('should render expected tooltip content', () => {
          cy.get('.v-popper').trigger('mouseenter')

          cy.findByTestId('cloud-data-tooltip-content')
          .should('be.visible')
          .and('contain', get(defaultMessages, msgKeys.noAccess).replace('{0}', get(defaultMessages, msgKeys.docs)))

          cy.findByTestId('request-access-button')
          .should('be.visible')
          .click()

          cy.percySnapshot()
        })
      })

      context('access requested', () => {
        beforeEach(() => {
          mountWithStatus('ACCESS_REQUESTED', msgKeys)
        })

        it('should render expected tooltip content', () => {
          cy.get('.v-popper').trigger('mouseenter')

          cy.findByTestId('cloud-data-tooltip-content')
          .should('be.visible')
          .and('contain', get(defaultMessages, msgKeys.noAccess).replace('{0}', get(defaultMessages, msgKeys.docs)))

          cy.findByTestId('access-requested-button')
          .should('be.visible')
          .should('be.disabled')

          cy.percySnapshot()
        })
      })

      context('logged out', () => {
        beforeEach(() => {
          mountWithStatus('LOGGED_OUT', msgKeys)
        })

        it('should render expected tooltip content', () => {
          cy.get('.v-popper').trigger('mouseenter')

          cy.findByTestId('cloud-data-tooltip-content')
          .should('be.visible')
          .and('contain', get(defaultMessages, msgKeys.notConnected).replace('{0}', get(defaultMessages, msgKeys.docs)))

          cy.findByTestId('login-button')
          .should('be.visible')
          .click()

          cy.get('@showLoginSpy').should('have.been.calledOnce')

          cy.percySnapshot()
        })
      })

      context('not found', () => {
        beforeEach(() => {
          mountWithStatus('NOT_FOUND', msgKeys)
        })

        it('should render expected tooltip content', () => {
          cy.get('.v-popper').trigger('mouseenter')

          cy.findByTestId('cloud-data-tooltip-content')
          .should('be.visible')
          .and('contain', get(defaultMessages, msgKeys.notConnected).replace('{0}', get(defaultMessages, msgKeys.docs)))

          cy.findByTestId('reconnect-button')
          .should('be.visible')
          .click()

          cy.get('@showConnectToProjectSpy').should('have.been.calledOnce')

          cy.percySnapshot()
        })
      })
    })
  })
})