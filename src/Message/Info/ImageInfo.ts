/** 图像信息 */
export default interface ImageInfo {
  /** 图像名称 */
  name?: string;
  /** 图像id */
  id?: string | number;
  /** 图像url */
  url?: string;
  /** 图像尺寸 */
  size?: [number, number]
}