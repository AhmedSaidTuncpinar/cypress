<template>
  <TopNavList v-if="versions && runningOldVersion">
    <template #heading="{ open }">
      <i-cy-arrow-outline-down_x16
        class="group-hocus:icon-dark-indigo-500 group-hocus:icon-light-indigo-50 h-16px w-16px"
        :class="open ? 'icon-dark-indigo-500 icon-light-indigo-50' : 'icon-dark-gray-500 icon-light-gray-100'"
      />
      <span data-cy="topnav-version-list">v{{ versions.current.version }} <span
        class="text-indigo-300"
        aria-hidden="true"
      >•</span> Upgrade</span>
    </template>

    <TopNavListItem
      class="px-16px py-8px min-w-278px"
      data-cy="update-hint"
    >
      <div class="whitespace-nowrap">
        <ExternalLink
          :href="`${releasesUrl}/tag/v${versions.latest.version}`"
          class="font-semibold text-indigo-500"
          data-cy="latest-version"
        >
          {{ versions.latest.version }}
        </ExternalLink>
        <br>
        <span class="text-gray-500 leading-20px text-14px">{{ t('topNav.released') }} {{ versions.latest.released }}</span>
      </div>
      <template #suffix>
        <span class="rounded-md bg-indigo-50">
          <span class=" text-indigo-500 p-5px">
            {{ t('topNav.latest') }}
          </span>
        </span>
      </template>
    </TopNavListItem>

    <TopNavListItem class="px-16px py-8px pb-16px">
      <p class="text-gray-500 text-14px py-8px pb-16px leading-normal">
        {{ t('topNav.runningOldVersion') }}
      </p>
      <Button
        class="w-full"
        @click="showUpdateModal = true"
      >
        Update to {{ versions.latest.version }}
      </Button>
    </TopNavListItem>

    <TopNavListItem
      class="bg-yellow-50 px-16px py-8px"
    >
      <div class="whitespace-nowrap">
        <ExternalLink
          :href="`${releasesUrl}/tag/v${versions.current.version}`"
          class="font-semibold text-amber-800"
          data-cy="current-version"
        >
          {{ versions.current.version }}
        </ExternalLink>
        <br>
        <span class="text-gray-600 text-14px">{{ t('topNav.released') }} {{ versions.current.released }}</span>
      </div>
      <template #suffix>
        <span class="rounded-md bg-yellow-100">
          <span class="text-amber-800 p-5px">
            {{ t('topNav.installed') }}
          </span>
        </span>
      </template>
    </TopNavListItem>

    <TopNavListItem class="text-center p-16px text-indigo-600">
      <ExternalLink
        :href="releasesUrl"
        class="block w-full border-gray-100 py-8px text-12px whitespace-nowrap border-rounded border-1 hover:no-underline hover:border-gray-200"
      >
        {{ t('topNav.seeAllReleases') }}
      </ExternalLink>
    </TopNavListItem>
  </TopNavList>

  <ExternalLink
    v-else-if="versions"
    :href="`${releasesUrl}/tag/v${versions.latest.version}`"
    class="text-gray-600 flex items-center gap-8px group hocus:text-indigo-500 hocus:outline-0 outline-transparent"
    :use-default-hocus="false"
  >
    <i-cy-box_x16
      class="group-hocus:icon-dark-indigo-500 group-hocus:icon-light-indigo-50 h-16px w-16px icon-dark-gray-500 icon-light-gray-100"
    />
    <span>
      v{{ versions.latest.version }}
    </span>
  </ExternalLink>

  <TopNavList v-if="props.gql?.currentProject?.currentBrowser && showBrowsers">
    <template #heading="{ open }">
      <img
        class="w-16px filter group-hocus:grayscale-0"
        :class="open ? 'grayscale-0' : 'grayscale'"
        :src="allBrowsersIcons[props.gql?.currentProject?.currentBrowser?.displayName || '']"
      >
      <span
        data-cy="topnav-browser-list"
      >{{ props.gql.currentProject?.currentBrowser?.displayName }} v{{ props.gql.currentProject?.currentBrowser?.majorVersion }}</span>
    </template>
    <TopNavListItem
      v-for="browser in props.gql.currentProject.browsers"
      :key="browser.id"
      class="px-16px py-12px min-w-240px cursor-pointer"
      :class="browser.isSelected ? 'bg-jade-50' : ''"
      :selectable="!browser.isSelected"
      @click="handleBrowserChoice(browser)"
    >
      <template #prefix>
        <!-- setting both width and min-width on these icons looks odd,
        but makes all possible browser icons happy about what size to be-->
        <img
          class="mr-16px min-w-26px w-26px"
          :src="allBrowsersIcons[browser.displayName]"
        >
      </template>
      <div>
        <button
          class="hocus-link-default box-border"
          :class="browser.isSelected ? 'text-jade-600' : 'text-indigo-600'"
        >
          {{ browser.displayName }}
        </button>
        <div
          class="font-normal text-gray-500 mr-20px whitespace-nowrap text-14px"
        >
          {{ t('topNav.version') }} {{ browser.version }}
        </div>
      </div>
      <template
        v-if="browser.isSelected"
        #suffix
      >
        <div>
          <i-cy-circle-check_x24 class="icon-dark-jade-100 icon-light-jade-500 w-24px h-24px" />
        </div>
      </template>
    </TopNavListItem>
  </TopNavList>

  <TopNavList
    variant="panel"
    role="region"
    aria-live="polite"
  >
    <template #heading="{ open }">
      <i-cy-life-ring_x16
        class=" group-hocus:icon-dark-indigo-500 group-hocus:icon-light-indigo-50 h-16px w-16px"
        :class="open ? 'icon-dark-indigo-500 icon-light-indigo-50' : 'icon-dark-gray-500 icon-light-gray-100'"
      />
      <span :class="{'text-indigo-600': open}">{{ t('topNav.docsMenu.docsHeading') }}</span>
    </template>
    <div
      v-if="docsMenuVariant === 'main'"
      class="flex p-16px gap-24px"
    >
      <DocsMenuContent
        :current-project-exists="!!props.gql?.currentProject"
        @setDocsContent="docsMenuVariant = $event"
      />
    </div>
    <div
      v-else
      ref="promptsEl"
      class="w-484px"
    >
      <div class="relative border-b border-b-gray-50 px-24px py-18px text-18px">
        {{ t(`topNav.docsMenu.prompts.${docsMenuVariant}.title`) }}
        <button
          aria-label="Close"
          class="absolute border-transparent rounded-full p-5px border-1 hover:border-indigo-300 hocus-default right-20px top-15px"
          @click="docsMenuVariant = 'main'"
        >
          <i-cy-delete_x12 class="icon-dark-gray-400 w-12px h-12px" />
        </button>
      </div>
      <PromptContent :type="docsMenuVariant" />
    </div>
  </TopNavList>

  <TopNavList
    v-if="$slots['login-title']"
    variant="panel"
  >
    <template #heading>
      <slot name="login-title" />
    </template>
    <slot name="login-panel" />
  </TopNavList>
  <UpdateCypressModal
    v-if="versions"
    :show="showUpdateModal"
    :installed-version="versions.current.version"
    :latest-version="versions.latest.version"
    :project-name="props.gql?.currentProject?.title"
    @close="showUpdateModal = false"
  />
</template>

<script setup lang="ts">
import TopNavListItem from './TopNavListItem.vue'
import TopNavList from './TopNavList.vue'
import PromptContent from './PromptContent.vue'
import { allBrowsersIcons } from '@packages/frontend-shared/src/assets/browserLogos'
import { gql, useMutation } from '@urql/vue'
import { TopNavFragment, TopNav_LaunchOpenProjectDocument, TopNav_SetBrowserDocument } from '../../generated/graphql'
import { useI18n } from '@cy/i18n'
import { computed, ref, Ref } from 'vue'
const { t } = useI18n()
import { onClickOutside, onKeyStroke, useTimeAgo } from '@vueuse/core'
import DocsMenuContent from './DocsMenuContent.vue'
import ExternalLink from '../ExternalLink.vue'
import Button from '../../components/Button.vue'
import UpdateCypressModal from './UpdateCypressModal.vue'

const releasesUrl = 'https://github.com/cypress-io/cypress/releases'

gql`
fragment TopNav on Query {
  versions {
    current {
      id
      version
      released
    }
    latest {
      id
      version
      released
    }
  }

  currentProject {
    id
    title
    currentBrowser {
      id
      displayName
      majorVersion
    }
    browsers {
      id
      isSelected
      displayName
      version
      majorVersion
    }
  }
}
`

gql`
mutation TopNav_LaunchOpenProject  {
  launchOpenProject
}
`

gql`
mutation TopNav_SetBrowser($id: ID!) {
  launchpadSetBrowser(id: $id)
}
`

const launchOpenProject = useMutation(TopNav_LaunchOpenProjectDocument)
const setBrowser = useMutation(TopNav_SetBrowserDocument)

const launch = () => {
  launchOpenProject.executeMutation({})
}

const handleBrowserChoice = async (browser) => {
  await setBrowser.executeMutation({ id: browser.id })
  launch()
}

const props = defineProps<{
  gql: TopNavFragment,
  showBrowsers?: boolean
}>()

const currentReleased = useTimeAgo(
  props.gql.versions?.current?.released
    ? new Date(props.gql.versions.current.released)
    : '',
)

const latestReleased = useTimeAgo(
  props.gql.versions?.latest?.released
    ? new Date(props.gql.versions.latest.released)
    : '',
)

const versions = computed(() => {
  if (!props.gql.versions) {
    return
  }

  if (!props.gql.versions) {
    return null
  }

  return {
    current: {
      released: currentReleased.value,
      version: props.gql.versions.current.version,
    },
    latest: {
      released: latestReleased.value,
      version: props.gql.versions.latest.version,
    },
  }
})

const runningOldVersion = computed(() => {
  return props.gql.versions ? props.gql.versions.current.released < props.gql.versions.latest.released : false
})

const showUpdateModal = ref(false)

const docsMenuVariant: Ref<'main' | 'orchestration' | 'ci'> = ref('main')

const promptsEl: Ref<HTMLElement | null> = ref(null)

// reset docs menu if click or keyboard navigation happens outside
// so it doesn't reopen on the one of the prompts

onClickOutside(promptsEl, () => {
  setTimeout(() => {
    // reset the content of the menu when
    docsMenuVariant.value = 'main'
  }, 300)
})

// using onKeyStroke twice as array of keys is not supported till vueuse 6.6:

const resetPrompt = (event) => {
  if (promptsEl.value === null) {
    return
  }

  const target = event.target as HTMLElement

  if (!promptsEl.value.contains(target)) {
    docsMenuVariant.value = 'main'
  }
}

onKeyStroke('Enter', (event) => {
  resetPrompt(event)
})

onKeyStroke(' ', (event) => {
  resetPrompt(event)
})

</script>