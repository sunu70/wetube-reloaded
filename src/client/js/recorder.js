import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;
// let을 사용하면 외부 stream 정의 한 것을 부를수있음!!

const handleDownload = async () => {
  const ffmpeg = createFFmpeg({ log: true });
  // {log:true} 무슨일이 벌어졌는지 로그로 확인
  await ffmpeg.load();
  // ffmpeg.load()에 await 사용하는 이유는 사용자가 소프트웨어를 사용하기 위해

  ffmpeg.FS("writeFile", "recording.webm", await fetchFile(videoFile));
  //"writeFile" ffmpeg의 가상의 세계에 파일 생성

  await ffmpeg.run("-i", "recording.webm", "-r", "60", "output.mp4");
  //-i = input,

  const mp4File = ffmpeg.FS("readFile", "output.mp4");

  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });

  const mp4Url = URL.createObjectURL(mp4Blob);
  // URL.createObjectURL() 브라우저에서 파일을 가르키는 마법의 url

  const a = document.createElement("a");
  a.href = mp4Url;
  a.download = "MyRecording.mp4";
  document.body.appendChild(a);
  a.click();
};

const handleStop = () => {
  startBtn.innerText = "Start Recording";
  startBtn.removeEventListener("click", handleStop);
  startBtn.addEventListener("click", handleStart);
};

const handleStart = () => {
  startBtn.innerText = "Stop Recording";
  startBtn.removeEventListener("click", handleStart);
  startBtn.addEventListener("click", handleStop);
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (event) => {
    // 이벤트가 종료가 되면 나올 때 씀
    videoFile = URL.createObjectURL(event.data);
    // createObjectURL 브라우저 메모리에서만 가능한 URL 생성
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };
  recorder.start();
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  });
  video.srcObject = stream;
  video.play();
};

init();

startBtn.addEventListener("click", handleStart);
