class ModelFormatError(Exception):
    def __init__(self, *args: object) -> None:
        super().__init__(*args)

class ModelLoadError(Exception):
    def __init__(self, *args: object) -> None:
        super().__init__(*args)