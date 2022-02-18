import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;
// let을 사용하면 외부 stream 정의 한 것을 부를수있음!!

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
};

const handleDownload = async () => {
  actionBtn.removeEventListener("click", handleDownload);

  actionBtn.innerText = "Transcoding...";

  actionBtn.disabled = true;

  const ffmpeg = createFFmpeg({ log: true });
  // {log:true} 무슨일이 벌어졌는지 로그로 확인
  await ffmpeg.load();
  // ffmpeg.load()에 await 사용하는 이유는 사용자가 소프트웨어를 사용하기 위해

  ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));
  //"writeFile" ffmpeg의 가상의 세계에 파일 생성

  await ffmpeg.run("-i", files.input, "-r", "60", files.output);
  //-i = files.input,

  await ffmpeg.run(
    "-i",
    files.input,
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    files.thumb
  );
  // -ss 영상의 특정 시간대로 갈 수 있게 해줌 / -frames:v ,"1" 이동한 시간의 스크린샷 한장 찍는다

  const mp4File = ffmpeg.FS("readFile", files.output);
  const thumbFile = ffmpeg.FS("readFile", files.thumb);

  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

  const mp4Url = URL.createObjectURL(mp4Blob);
  // URL.createObjectURL() 브라우저에서 파일을 가르키는 마법의 url
  const thumbUrl = URL.createObjectURL(thumbUrl);

  downloadFile(mp4Url, "MyRecording.mp4");
  downloadFile(thumbUrl, "MyThumbnail.jpg");

  const thumbA = document.createElement("a");
  thumbA.href = thumbUrl;
  thumbA.download = "MyThumbnail.jpg";
  document.body.appendChild(thumbA);
  thumbA.click();

  ffmpeg.FS("unlink", files.files.input);
  ffmpeg.FS("unlink", files.files.output);
  ffmpeg.FS("unlink", files.thumb);

  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(videoFile);
  // revokeObjectURL 지우고 싶다는 의미

  actionBtn.disabled = true;
  actionBtn.innerText = "Record Again";
  actionBtn.addEventListener("click", handleDownload);
};

const handleStop = () => {
  actionBtn.innerText = "Start Recording";
  actionBtn.removeEventListener("click", handleStop);
  actionBtn.addEventListener("click", handleStart);
};

const handleStart = () => {
  actionBtn.innerText = "Stop Recording";
  actionBtn.removeEventListener("click", handleStart);
  actionBtn.addEventListener("click", handleStop);
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (event) => {
    // 이벤트가 종료가 되면 나올 때 씀
    videoFile = URL.createObjectURL(event.data);
    // createObjectURL 브라우저 메모리에서만 가능한 URL 생성
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
    actionBtn.innerText = "Download";
    actionBtn.disabled = false;
    actionBtn.addEventListener("click", handleDownload);
  };
  recorder.start();
  setTimeout(() => {
    recorder.stop();
  }, 5000);
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

actionBtn.addEventListener("click", handleStart);
