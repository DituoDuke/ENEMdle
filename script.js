async function getRandomQuestionsBatch() {
  const year = Math.floor(Math.random() * (2023 - 2009 + 1)) + 2009
  const offset = Math.floor(Math.random() * 170)
  const res = await fetch(`https://api.enem.dev/v1/exams/${year}/questions?limit=50&offset=${offset}`)
  const data = await res.json() 

  return data.questions
}

const title = document.querySelector("#title")
const context = document.querySelector("#context")
const alterIntro = document.querySelector("#alterIntro")
const alternativesEl = document.querySelector("#alternatives")
let correctAnswers = []
const correctAnswersEl = document.querySelector("#correctAnswers")
const selectedSubjects = new Set()
const resetBtn = document.querySelector("#resetBtn")

document.querySelector("#nextBtn").addEventListener("click", () => {
  verifyQuestion()
})
document.querySelector("#nextBtn").disabled = true
document.querySelector("#nextBtn").style.display = "none"

const saved = JSON.parse(localStorage.getItem("correctAnswers"))
if (Array.isArray(saved)) {
  correctAnswers.push(...saved)
}
update()
document.querySelectorAll(".toggle").forEach(btn => {
  btn.addEventListener("click", () => {
    const subject = btn.dataset.subject

    if (selectedSubjects.has(subject)) {
      selectedSubjects.delete(subject)
      btn.classList.remove("active")
    } else {
      selectedSubjects.add(subject)
      btn.classList.add("active")
    }
    verifyQuestion()
    console.log("Matérias selecionadas:", [...selectedSubjects])
  })
})
resetBtn.addEventListener("click", () => {
  correctAnswers = []
  update()
  localStorage.setItem("correctAnswers", JSON.stringify(correctAnswers))
})

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

async function verifyQuestion() {
  let batch = await getRandomQuestionsBatch()
  batch = shuffle(batch)
  console.log(batch)
  const q = batch.find(q =>
    q.title &&
    q.alternatives &&
    q.alternatives.length > 0 &&
    q.correctAlternative &&
    (
      selectedSubjects.size === 0 ||         
      selectedSubjects.has(q.discipline)    
    )
  )

  if (q) {
    applyQuestion(q)
  } else {
    verifyQuestion()
  }
}
async function applyQuestion(q) {
  title.innerText = q.title + " - " + q.discipline
document.querySelector("#nextBtn").disabled = true
  document.querySelector("#nextBtn").style.display = "none"
context.innerHTML = q.context
  ? q.context.replace(/!\[\]\((.*?)\)/g, '<img src="$1" class="question-img">').replace(/\n/g, "<br>")
  : "(Sem contexto disponível)"
  alterIntro.innerText = q.alternativesIntroduction || "(Sem introdução)"
  alternativesEl.innerHTML = "" 

  
q.alternatives.forEach(alt => {
  const btn = document.createElement("button")
  btn.className = "alt"


  if (alt.file) {
    btn.innerHTML = `${alt.letter}.<br><img src="${alt.file}" class="alt-img">`
  } else {
    btn.innerText = `${alt.letter}. ${alt.text}`
  }

  btn.addEventListener("click", () => {
    checkAnswer(alt.letter, q.correctAlternative)
  })
  alternativesEl.appendChild(btn)
})

}

function update() {
  let corrects = 0
  correctAnswers.forEach(answer => {
    if (answer) corrects++
  })
  correctAnswersEl.innerText = `Certas: ${corrects} de ${correctAnswers.length}`
}

function checkAnswer(answered, correct) {
  const buttons = document.querySelectorAll(".alt")
  correctAnswers.push(answered === correct)
  localStorage.setItem("correctAnswers", JSON.stringify(correctAnswers))
  update()

  buttons.forEach(btn => {
    const letra = btn.innerText[0]
    if (letra === correct) btn.style.background = "#2ecc71"
    if (letra === answered && answered !== correct) btn.style.background = "#e74c3c"
    btn.disabled = true
  })
  document.querySelector("#nextBtn").disabled = false
  document.querySelector("#nextBtn").style.display = "block"
}


verifyQuestion()
