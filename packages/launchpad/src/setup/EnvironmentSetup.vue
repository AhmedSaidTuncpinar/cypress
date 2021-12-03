<template>
  <WizardLayout
    :can-navigate-forward="props.gql.canNavigateForward"
    class="max-w-776px"
  >
    <div class="m-5">
      <SelectFramework
        :name="t('setupPage.projectSetup.frameworkLabel')"
        :options="frameworks ?? []"
        :value="props.gql.framework?.id ?? undefined"
        :placeholder="t('setupPage.projectSetup.frameworkPlaceholder')"
        @select="setFEFramework"
      />
      <SelectBundler
        :name="t('setupPage.projectSetup.bundlerLabel')"
        :disabled="bundlers.length === 1"
        :options="bundlers || []"
        :value="props.gql.bundler?.id ?? undefined"
        :placeholder="t('setupPage.projectSetup.bundlerPlaceholder')"
        @select="setFEBundler"
      />
      <SelectLanguage
        :name="t('setupPage.projectSetup.languageLabel')"
        :options="languages || []"
        :value="props.gql.language?.id ?? 'js'"
        @select="setLanguage"
      />
    </div>
  </WizardLayout>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import WizardLayout from './WizardLayout.vue'
import SelectFramework from '../components/select/SelectFramework.vue'
import SelectBundler from '../components/select/SelectBundler.vue'
import SelectLanguage from '../components/select/SelectLanguage.vue'
import { gql } from '@urql/core'
import {
  EnvironmentSetupFragment,
  EnvironmentSetupSetFrameworkDocument,
  EnvironmentSetupSetBundlerDocument,
  EnvironmentSetupSetCodeLanguageDocument,
  FrontendFrameworkEnum,
  SupportedBundlers,
  CodeLanguageEnum,
} from '../generated/graphql'
import { useMutation } from '@urql/vue'
import { useI18n } from '@cy/i18n'

gql`
mutation EnvironmentSetupSetFramework($framework: FrontendFrameworkEnum!) {
  wizardSetFramework(framework: $framework) 
}
`

gql`
mutation EnvironmentSetupSetBundler($bundler: SupportedBundlers!) {
  wizardSetBundler(bundler: $bundler) 
}
`

gql`
mutation EnvironmentSetupSetCodeLanguage($language: CodeLanguageEnum!) {
  wizardSetCodeLanguage(language: $language)
}
`

gql`
fragment EnvironmentSetup on Wizard {
  canNavigateForward
  bundler {
    id
    name
    type
    isSelected
  }
  framework {
    type
    id
    name
    isSelected
    supportedBundlers {
      id
      type
      name
    }
  }
  frameworks {
    id
    name
    isSelected
    type
  }
  allBundlers {
    id
    name
    type
  }
  language {
    id
    name
    isSelected
    type
  }
  allLanguages {
    id
    name
    type
  }
}
`

const props = defineProps<{
  gql: EnvironmentSetupFragment
}>()

const setFramework = useMutation(EnvironmentSetupSetFrameworkDocument)
const setBundler = useMutation(EnvironmentSetupSetBundlerDocument)
const setLanguageMutation = useMutation(EnvironmentSetupSetCodeLanguageDocument)

const setFEBundler = (bundler: SupportedBundlers) => {
  setBundler.executeMutation({ bundler })
}

const setFEFramework = (framework: FrontendFrameworkEnum) => {
  setFramework.executeMutation({ framework })
}

const setLanguage = (language: CodeLanguageEnum) => {
  setLanguageMutation.executeMutation({ language })
}

const { t } = useI18n()

const bundlers = computed(() => props.gql.framework?.supportedBundlers ?? props.gql.allBundlers)
const frameworks = computed(() => props.gql.frameworks ?? [])
const languages = computed(() => props.gql.allLanguages ?? [])
</script>