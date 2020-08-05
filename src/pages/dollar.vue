<template>
  <q-page>
    <div class="container q-pa-md">
      <div class="row">
        <div class="col-12">

          <q-form
            @submit="send"
            class="q-gutter-md"
          >
            <q-input
              filled
              v-model="file"
              float-label="Dólar historic CSV"
              hint="Dólar historic CSV"
              type="file"
            />

            <div class="row justify-end">
              <span class="">{{progess}}</span>
            </div>

            <div>
              <q-btn label="Predicate" type="submit" color="orange"/>
            </div>
          </q-form>

        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  data () {
    return {
      file: '',
      progess: 'Aguardando Arquivo'
    }
  }
}
</script>
