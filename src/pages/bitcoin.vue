<template>
  <q-page>
    <div class="container q-pa-md">
      <div class="row">
        <span class="text-h4">Previsão Bitcoin</span>
      </div>
      <div class="row q-mb-md">
        <div class="col-12">
          <q-banner rounded class="bg-info text-white">
            Rede Neural Artifical criada a partir de um documento CSV com dados (DATA, FECHAMENTO, ABERTURA, MÁXIMA E MÍNIMA) do Bitcoin ao longo de um tempo, com o intuíto de indicar a previsão do dia seguinte apartir dos dados dia informado.
          </q-banner>
        </div>
      </div>
      <div class="row">
        <div class="col-12">

          <q-form
            @submit="predicate"
            class="q-gutter-md"
          >
            <q-input
              filled
              v-model="file"
              @input="val => { file = val[0] }"
              float-label="Dólar historic CSV"
              hint="Dollar historic CSV"
              type="file"
              @change="uploadFile"
            />

            <div class="row">
              INSIRA A COTAÇÃO DE HOJE
            </div>

            <div class="row justify-between">
              <div class="q-gutter-md">
                <q-input filled label="Fechamento R$" v-model="input.close" :rules="[val => !!val && val > 0 || 'Field is required']"/>
              </div>
              <div class="q-gutter-md">
                <q-input filled label="Abertura R$" v-model="input.open" :rules="[val => !!val && val > 0 || 'Field is required']"/>
              </div>
              <div class="q-gutter-md">
                <q-input filled label="Máxima R$" v-model="input.higth" :rules="[val => !!val && val > 0 || 'Field is required']"/>
              </div>
              <div class="q-gutter-md">
                <q-input filled label="Mínima R$" v-model="input.low" :rules="[val => !!val && val > 0 || 'Field is required']"/>
              </div>
            </div>

            <div class="row justify-end">
              <q-btn label="Predicate" type="submit" color="orange" :disable="proguess === 'Processando...'"/>
            </div>

          </q-form>

          <hr>

          <div class="row">
            <div class="col-md-6 col-xs-6">
              <div class="row q-pa-sm">
                Entradas:
              </div>
              <q-input
                class="q-pa-sm"
                v-model="arquivo"
                filled
                type="textarea"
                readonly
                rows="12"
              />
            </div>
            <div class="col-md-6 col-xs-6">
              <div class="row q-pa-sm">
                Saída:
              </div>
              <q-input
                class="q-pa-sm"
                v-model="proguess"
                filled
                type="textarea"
                readonly
                rows="12"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
// import { readFileSync } from 'fs'
export default {
  data () {
    return {
      file: '',
      proguess: 'Aguardando Arquivo',
      response: '',
      arquivo: null,
      input: {
        open: 6386.6,
        close: 7190.3,
        higth: 7373.8,
        low: 6386.5
      }
    }
  },
  created () {
    this.$q.loading.hide()
  },
  methods: {
    uploadFile (event) {
      this.proguess = 'Carregando dados...'
      var file = event.target.value
      file = file.replace(/\\/g, '-')
      const arr = file.split('-')
      this.$axios.get('/arquivos/' + arr[arr.length - 1])
        .then((data) => {
          this.arquivo = data.data.toString().trim()
        })
      this.proguess = 'Dados carregados!'
    },
    predicate () {
      this.$q.loading.show({ message: 'Processando...' })
      if (this.arquivo === null) {
        this.proguess = 'Adicione um arquivo!'
        return
      }
      this.proguess = 'Processando...'
      try {
        const linhas = this.arquivo.split('\r\n')
        const X = []
        const Y = []
        let qtdLinhas = 0

        for (let l = 1; l < linhas.length; l++) {
          let celulas1 = []
          if (qtdLinhas === (linhas.length - 2)) celulas1 = ['31.12.2018', 3.8813, 3.8813, 3.8813, 3.8813]
          else celulas1 = linhas[l + 1].split(';')

          const celulas2 = linhas[l].split(';')

          const FechamentoX = Number(celulas1[1])
          const AberturaX = Number(celulas1[2])
          const MaximaX = Number(celulas1[3])
          const MinimaX = Number(celulas1[4])

          X.push([FechamentoX, AberturaX, MaximaX, MinimaX])

          const FechamentoY = Number(celulas2[1])
          const AberturaY = Number(celulas2[2])
          const MaximaY = Number(celulas2[3])
          const MinimaY = Number(celulas2[4])

          Y.push([FechamentoY, AberturaY, MaximaY, MinimaY])

          qtdLinhas++
        }

        const model = this.$tf.sequential()
        const inputLayer = this.$tf.layers.dense({ units: 4, inputShape: [4] })

        const learningRate = 0.000000001
        const optimizer = this.$tf.train.sgd(learningRate)

        model.add(inputLayer)
        model.compile({ loss: 'meanSquaredError', optimizer: optimizer })

        const x = this.$tf.tensor(X, [qtdLinhas, 4])
        const y = this.$tf.tensor(Y)

        const arrInput = [[this.input.close, this.input.open, this.input.higth, this.input.low]] // HOJE
        const input = this.$tf.tensor(arrInput, [1, 4])

        model.fit(x, y, { epochs: 550 }).then(() => {
          let output = model.predict(input).dataSync()
          output = this.ordenaDados(output)

          this.proguess = 'PREVISÃO DAS COTAÇOES PARA AMANHÃ:\n\n'
          this.proguess += `Fechamento: R$ ${Number(output[0]).toFixed(1)}\n\n`
          this.proguess += `Abertura:   R$ ${Number(output[1]).toFixed(1)}\n\n`
          this.proguess += `Máxima:     R$ ${Number(output[2]).toFixed(1)}\n\n`
          this.proguess += `Mínima:     R$ ${Number(output[3]).toFixed(1)}\n\n`

          this.$q.loading.hide()
        })
      } catch (error) {
        this.$q.loading.hide()
        this.progess = 'Ocorreu um erro: ' + error
      }
    },
    ordenaDados (array) {
      function sortNumber (a, b) {
        return (a - b)
      }

      let fechamento = array[0]
      let abertura = array[1]
      let maxima = array[2]
      let minima = array[3]

      let cotacoes = [fechamento, abertura, maxima, minima]
      cotacoes = cotacoes.sort(sortNumber)

      const menor = cotacoes[0]
      const maior = cotacoes[3]

      if (fechamento < minima) fechamento = minima
      if (abertura < minima) abertura = minima
      if (maxima < minima) maxima = minima
      minima = menor

      if (fechamento > maxima) fechamento = maxima
      if (abertura > maxima) abertura = maxima
      if (minima > maxima) minima = maxima
      maxima = maior

      cotacoes = [fechamento, abertura, maxima, minima]
      return cotacoes
    }
  }
}
</script>
