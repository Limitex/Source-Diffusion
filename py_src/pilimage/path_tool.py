import os

def generate_unique_filepath(base_path, extension):
    iteration = 0
    suffix = '.' + extension
    new_path = f'{base_path}{suffix}'
    while os.path.exists(new_path):
        iteration += 1
        new_path = f'{base_path}-{iteration}{suffix}'
    return new_path