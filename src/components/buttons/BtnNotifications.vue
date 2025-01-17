<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';

import NoticeModal from '@/components/modals/NoticeModal.vue';

import { dateTimeToStr } from '@/service/DataFilters';
import { useNotice } from '@/stores/api/notices';

const toast = useToast();

const { findAll, removeOne } = useNotice();

const records = ref([]);
const refMenu = ref();
const refModal = ref();

const onRecords = async () => {
  try {
    records.value = await findAll({});
  } catch (err) {
    toast.add({
      severity: 'warn',
      summary: 'Попередження',
      detail: 'Записи не оновлено',
      life: 3000
    });
  }
};

const onRemoveRecord = async id => {
  try {
    await removeOne({ id });
    toast.add({
      severity: 'success',
      summary: 'Інформація',
      detail: 'Запис видалено',
      life: 3000
    });
  } catch (err) {
    toast.add({
      severity: 'warn',
      summary: 'Попередження',
      detail: 'Запис не видалено',
      life: 3000
    });
  } finally {
    await onRecords();
  }
};

onMounted(async () => {
  await onRecords();
});
</script>

<template>
  <div>
    <NoticeModal ref="refModal" @close="async () => await onRecords()" />

    <OverlayPanel ref="refMenu" appendTo="body" class="w-[35rem]">
      <div class="flex w-full flex-col">
        <div class="flex justify-between px-2 pt-2">
          <div class="flex items-center justify-center">
            <Avatar size="large" icon="pi pi-bell text-xl" class="mr-4" />
            <div>
              <p class="line-height-2 text-lg font-bold">Сповіщення</p>
              <p class="line-height-2 text-base font-normal text-surface-500">
                Системні сповіщення
              </p>
            </div>
          </div>
          <div class="flex items-center justify-center">
            <Button
              size="large"
              variant="text"
              icon="pi pi-plus-circle"
              severity="secondary"
              class="bg-transparent text-muted-color hover:bg-emphasis"
              v-tooltip.bottom="'Створити сповіщення'"
              @click="
                () => {
                  refMenu.hide();
                  refModal.toggle({});
                }
              "
              v-if="$planzvit?.isAdministrator"
            />
          </div>
        </div>

        <Divider />

        <DataView v-if="records?.length" :value="records" class="max-h-[30rem] overflow-auto">
          <template #list="{ items }">
            <div
              class="w-full flex-shrink-0 border-none p-4 py-2"
              v-for="(item, index) in items"
              :key="index"
            >
              <div class="flex flex-row justify-start gap-3">
                <div class="align-items-start flex w-full flex-col overflow-auto">
                  <div class="flex w-full items-center">
                    <Avatar icon="pi pi-bell text-xl" size="large" class="mr-2 text-primary" />
                    <div class="align my-2 flex flex-col">
                      <span class="text-xl font-medium text-primary">{{ item?.title }}</span>
                      <span class="font-normal text-muted-color">
                        {{ dateTimeToStr(item?.createdAt) || '-' }}
                      </span>
                    </div>
                  </div>
                  <span class="whitespace-normal text-pretty break-all text-justify text-sm">
                    {{ item?.text }}
                  </span>
                </div>
                <div class="my-4 flex flex-col items-start">
                  <Button
                    text
                    plain
                    rounded
                    icon="pi pi-times"
                    class="!bg-transparent !text-muted-color hover:!bg-emphasis"
                    v-tooltip.bottom="'Закрити сповіщення'"
                    @click="onRemoveRecord(item.id)"
                  />
                </div>
              </div>
              <Divider />
            </div>
          </template>
        </DataView>

        <div class="flex flex-col items-center justify-center p-2" v-else>
          <p class="text-md font-medium text-muted-color">Сповіщення не знайдені</p>
        </div>
      </div>
    </OverlayPanel>

    <OverlayBadge
      :value="records.length"
      :pt="{
        pcBadge: {
          root: [
            '!translate-x-1 !-translate-y-1 !text-sm',
            {
              '!hidden': !records?.length
            }
          ]
        }
      }"
    >
      <Button
        size="large"
        variant="text"
        icon="pi pi-bell"
        severity="secondary"
        class="bg-transparent text-muted-color hover:bg-emphasis"
        @click="event => refMenu.toggle(event)"
        v-tooltip.bottom="'Сповіщення'"
      />
    </OverlayBadge>
  </div>
</template>
