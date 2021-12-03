<template>
  <SettingsSection data-cy="settings-experiments">
    <template #title>
      {{ t('settingsPage.experiments.title') }}
    </template>
    <template #description>
      <i18n-t keypath="settingsPage.experiments.description">
        <ExternalLink
          href="https://docs.cypress.io"
        >
          {{ t('links.learnMore') }}
        </ExternalLink>
      </i18n-t>
    </template>
    <div
      class="mx-auto first:border-t-0 border-gray-200 rounded grid gap-0 align-center border px-16px"
    >
      <ExperimentRow
        v-for="experiment in localExperiments"
        :key="experiment.key"
        data-testid="experiment"
        class="border-t-1 first:border-0 py-20px"
        :experiment="experiment"
      />
    </div>
  </SettingsSection>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import ExperimentRow from './ExperimentRow.vue'
import SettingsSection from '../SettingsSection.vue'
import ExternalLink from '@cy/gql-components/ExternalLink.vue'
import { experiments as defaultExperiments } from './projectSettings'

// eslint-disable-next-line no-duplicate-imports
import type { Experiment } from './projectSettings'
import { useI18n } from '@cy/i18n'

const props = defineProps<{
  experiments?: Experiment[]
}>()

const localExperiments = computed(() => props.experiments || defaultExperiments)
const { t } = useI18n()
</script>