import Video from "../models/Video";

export const home = async (req, res) => {
  const videos = await Video.find({}).sort({ createdAt: "desc" });
  return res.render("home", { pageTitle: "Home", videos });
  // 변수는 마음대로 넣어도됨 ex) {pageTitle : "Home", content : "Home!"}
  // Video.find({}, (error, videos) => {
  //  console.log("errors", error);
  //  console.log("videos", videos);
  // });
  //= const handlSearch = (error, videos) => {console.log("errors",error) console.log("videos", videos)}
};
export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  return res.render("watch", { pageTitle: `Watching: `, video });
};
export const getEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  return res.render("edit", { pageTitle: `Editing: `, video });
};
export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  // req.body = edit에 있는 form의 value의 javascript representation 임
  const video = await Video.exists({ _id: id });
  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });

  await video.save();
  return res.redirect(`/videos/${id}`);
  // res.redirect()는, 브라우저가 redirect(자동으로 이동)하도록 하는거임
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const { title, description, hashtags } = req.body;
  try {
    await Video.create({
      title,
      description,
      hashtags: Video.formatHashtags(hashtags),
    });
    return res.redirect("/");
  } catch (error) {
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  await Video.findByIdAndDelete(id);
  // delete Video
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    const videos = await Video.find({
      title: {
        $regex: new RegExp(`^${keyword}$`, "i"),
      },
    });
    console.log(videos);
  }
  return res.render("search", { pageTitle: "Search", videos });
};
