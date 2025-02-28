export interface Iimage {
  uniqueName: string; //key for the control and required
  source: React.JSX.Element | string; //source can be in url/svg/encrypted form and should not empty
  type?: string; //Type of image, Default svg
  altSource?: string; // It will used to show the alternative image or text if source image not found,
  styleClasses?: string; //tailwind or another class
  tooltip?: string; //Tooltip will be shown on image if provided
}
