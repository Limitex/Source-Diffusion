import json
import os
import time

from py_src.lib.apiModel import GenerateStreamInput

def saveimage(savepath, image, gc :GenerateStreamInput):
    os.makedirs(savepath, exist_ok=True)
    generateData = json.dumps(gc.dict())

    def dup(path, ext):
        for n in range(1000000):
            suff = '.' + ext
            if n:
                suff = f'-{n}.' + ext
            if not os.path.exists(path + suff):
                break
        return path + suff

    def save(path, mode, data, txt):
        try:
            with open(path, mode) as f:
                f.write(data)
        except Exception as e:
            print(txt, e)

    imagespath = os.path.join(savepath, "images")
    datapath = os.path.join(savepath, "data")

    os.makedirs(imagespath, exist_ok=True)
    os.makedirs(datapath, exist_ok=True)

    id = str(hex(int(time.time() * 10 ** 6))).replace('0x', '').upper()

    imagefilepath = dup(os.path.join(imagespath, id), 'png')
    datafilepath = dup(os.path.join(datapath, id), 'txt')

    image.save(imagefilepath)

    try:
        with open(datafilepath, "w") as f:
            f.write(generateData)
    except Exception as e:
        print("failed to save image data:", e)
