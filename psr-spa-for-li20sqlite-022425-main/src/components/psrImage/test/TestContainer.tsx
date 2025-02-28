import {
  sampleImageUri1,
  // sampleImageUri2,
  // sampleImageSvg1,
  // sample3ImageBase64Png,
  // sample4ImageBase64Jpeg,
  // sample5ImageBase64Gif,
  // sample7ImageUrlPng,
  // sample8ImageUrlJpg,
} from "../sampleData/TestJson";
import ImageViewer from "../Image";

function TestContainer() {
  return (    
    <div className="psr-parent-container">
      {/* <h4>Using URI SVG</h4> */}
      <ImageViewer {...sampleImageUri1} />
      {/* <ImageViewer {...sampleImageUri1} /> */}
      {/* <h4>Using string svg</h4>
      <ImageViewer {...sampleImageUri2} />
      <h4>Using SVG Element *from HeroIcon</h4>
      <ImageViewer {...sampleImageSvg1} />
      <h4>Using Base 64 PNG</h4>
      <ImageViewer {...sample3ImageBase64Png} />
      <h4>Using Base 64 JPEG</h4>
      <ImageViewer {...sample4ImageBase64Jpeg} />
      <h4>Using Base 64 GIF</h4>
      <ImageViewer {...sample5ImageBase64Gif} />
      <h4>Using URL PNG</h4>
      <ImageViewer {...sample7ImageUrlPng} />
      <h4>Using URL JPG</h4>
      <ImageViewer {...sample8ImageUrlJpg} /> */}
    </div>
  );
}

export default TestContainer;
