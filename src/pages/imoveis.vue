<template>
  <q-page>
    <div class="container q-pa-md">
      <div class="row">
        <span class="text-h4">Previsão Imóveis</span>
      </div>
      <div class="row q-mb-md">
        <div class="col-12">
          <q-banner rounded class="bg-info text-white">
            Rede Neural Artifical criada a partir de um documento CSV com dados (TAMANHO, IDADE, BAIRRO, QUARTOS, BANHEIROS, GARAGEM E PREÇO) de imóveis permitindo informar o preço de um imóvel de tamanho e idade fornecidos pelo usuário.
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
              hint="Properties historic CSV"
              type="file"
              @change="uploadFile"
            />

            <div class="row">
              INSIRA OS DADOS DO ÍMOVEL
            </div>

            <div class="row justify-between">
              <div class="q-gutter-md">
                <q-input filled label="Tamanho M²" v-model="input.size" :rules="[val => !!val && val > 0 || 'Field is required']"/>
              </div>
              <div class="q-gutter-md">
                <q-input filled label="Idade Anos" v-model="input.age" :rules="[val => !!val && val > 0 || 'Field is required']"/>
              </div>
              <div class="q-gutter-md">
                <q-input filled label="Bairro estrelas" v-model="input.place" :rules="[val => !!val && val > 0 || 'Field is required']"/>
              </div>
              <div class="q-gutter-md">
                <q-input filled label="Quartos" v-model="input.rooms" :rules="[val => !!val && val > 0 || 'Field is required']"/>
              </div>
              <div class="q-gutter-md">
                <q-input filled label="Banheiros" v-model="input.bathroom" :rules="[val => !!val && val > 0 || 'Field is required']"/>
              </div>
              <div class="q-gutter-md">
                <q-input filled label="Garagem" v-model="input.garage" :rules="[val => !!val && val > 0 || 'Field is required']"/>
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
      file: null,
      proguess: 'Aguardando Arquivo',
      response: '',
      arquivo: null,
      input: {
        size: 0,
        age: 0,
        rooms: 0,
        place: 0,
        bathroom: 0,
        garage: 0
      },
      arrX: [],
      arrY: []
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
          this.arquivo = data.data
          let caractere = ','
          var data2 = data.data
          if (data2.indexOf(';') >= 0) caractere = ';'
          var arrLinha = data2.split('\r\n')

          var titulos = arrLinha[0].split(caractere)
          var qtdEntradas = titulos.filter((x) => { return x === 'input' }).length
          var sumX = 0

          for (let i = 1; i < arrLinha.length; i++) {
            var arrCelula = arrLinha[i].split(caractere)
            sumX = 0
            for (let j = 0; j < arrCelula.length; j++) {
              if (arrCelula[j].toString().trim().length > 0) {
                if (j < qtdEntradas) {
                  sumX += parseFloat(arrCelula[j])
                } else {
                  this.arrY.push(parseFloat(arrCelula[j]))
                }
              }
            }
            if (sumX > 0) this.arrX.push(parseFloat(sumX / qtdEntradas))
          }
        })
      this.proguess = 'Dados carregados!'
    },
    predicate () {
      if (!this.file) {
        this.proguess = 'Adicione um arquivo!'
        return
      }
      this.$q.loading.show({ message: 'Processando...' })
      this.proguess = 'Processando...'
      var Input = (parseFloat(this.input.size) + parseFloat(this.input.age) + parseFloat(this.input.place) + parseFloat(this.input.rooms) + parseFloat(this.input.bathroom) + parseFloat(this.input.garage)) / 6
      try {
        var units = 1
        var inputShape = 1
        var linesX = Number(this.arrX.length)
        var linesInput = 1

        const model = this.$tf.sequential()
        const inputLayer = this.$tf.layers.dense({ units: units, inputShape: [inputShape] })
        model.add(inputLayer)
        model.compile({ loss: 'meanSquaredError', optimizer: this.$tf.train.sgd(0.00001) })

        const x = this.$tf.tensor(this.arrX, [linesX, inputShape])
        const y = this.$tf.tensor(this.arrY)
        const input = this.$tf.tensor(Input, [linesInput, inputShape])
        console.log(input)
        model.fit(x, y, { epochs: 550 }).then(() => {
          let output = model.predict(input).dataSync()
          output = this.converteArray(output)
          output = this.aproximaOutput(output)
          this.proguess = 'Preço Estimado: R$' + output
          this.$q.loading.hide()
        })
      } catch (error) {
        this.$q.loading.hide()
        this.progess = 'Ocorreu um erro: ' + error
      }
    },
    converteArray (array) {
      var result = []
      for (let i = 0; i < array.length; i++) {
        result.push(Math.ceil(array[i].toFixed(0)))
      }
      return result
    },
    aproximaOutput (number) {
      var two = number.toString().substr(0, 2)
      return Number(two.padEnd(number.toString().length, 0))
    }
  }
}
</script>
