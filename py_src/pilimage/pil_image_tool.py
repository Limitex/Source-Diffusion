from PIL import Image, PngImagePlugin

class PilImageTool:
    def __init__(self, image: Image.Image) -> None:
        self.__image = image

    def save_append_metadata(self, save_path: str, metadata: dict):
        img_info = self.__image.info
        img_info.update(metadata)
        self.save_with_metadata(save_path, img_info)
    
    def save_with_metadata(self, save_path: str, metadata: dict):
        info = PngImagePlugin.PngInfo()
        for k, v in metadata.items():
            info.add_itxt(k, str(v))
        self.__image.save(save_path, pnginfo=info)
