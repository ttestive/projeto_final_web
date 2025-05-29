import mongoose, { Schema, model, models } from 'mongoose'

const AlunoSchema = new Schema({
  nome: String,
  idade: Number,
  notas: [
    {
      materia: String,
      nota: Number,
    }
  ]
})

const Aluno = models.Aluno || model("Aluno", AlunoSchema)
export default Aluno
