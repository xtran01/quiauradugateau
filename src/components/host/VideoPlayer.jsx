export default function VideoPlayer({ url }) {
  return (
    <div className="video-player">
      <video src={url} controls autoPlay style={{ width: "100%", maxHeight: 480 }} />
    </div>
  );
}