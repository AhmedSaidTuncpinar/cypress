import FileList from './FileList.vue'
import { randomComponents } from '@packages/frontend-shared/cypress/support/mock-graphql/testStubSpecs'
import { ref, Ref } from 'vue'

const difficultFile = {
  baseName: '[...all].vue',
  fileExtension: '.vue',
}

const noResultsSlot = () => <div data-testid="no-results">No Results</div>
const noResultsSelector = '[data-testid=no-results]'
const fileRowSelector = '[data-testid=file-list-row]'

const allFiles = randomComponents(10, 'FileParts')

allFiles[1] = { ...allFiles[1], ...difficultFile }
describe('<FileList />', { viewportHeight: 500, viewportWidth: 400 }, () => {
  describe('with files', () => {
    const files = allFiles

    beforeEach(() => {
      const selectFileSpy = cy.spy().as('selectFileSpy')

      cy.mount(() => (<div class="resize overflow-auto min-w-300px m-2">
        <FileList onSelectFile={selectFileSpy} files={files} />
      </div>))
    })

    it('renders all of the files passed in', () => {
      cy.get(fileRowSelector)
      .should('have.length', 10)
    })

    it('emits a selectFile event when clicking on a row', () => {
      cy.get(fileRowSelector)
      .first()
      .click()
      .get('@selectFileSpy')
      .should('have.been.calledWith', files[0])
    })

    it('correctly formats a difficult file', () => {
      cy.get('body').contains('[...all]')
    })
  })

  describe('without files', () => {
    it('shows the no results slot', () => {
      const files: Ref<typeof allFiles> = ref([])
      let idx = 0

      cy.mount(() => (<div>
        <button data-testid="add-file"
          onClick={() => {
            files.value.push(allFiles[idx]); idx++
          }}>
          Add File
        </button>

        <FileList
          v-slots={{ 'no-results': noResultsSlot }}
          files={files.value} />

      </div>))
      .get(noResultsSelector).should('be.visible')
      .get('[data-testid=add-file]')
      .click()
      .get(noResultsSelector).should('not.exist')
    })
  })
})