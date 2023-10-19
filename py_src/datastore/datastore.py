import json
import os
from dataclasses import asdict, is_dataclass, fields
from typing import Type, Any, List, Optional


class DataStore:
    def __init__(self, data_class: Type[Any], filename: str, unique_key: str):
        if not is_dataclass(data_class):
            raise ValueError("Provided class is not a dataclass.")

        if unique_key not in [f.name for f in fields(data_class)]:
            raise ValueError(f"{unique_key} is not a field of the dataclass.")

        self._data_class = data_class
        self._filename = filename
        self._unique_key = unique_key
        self._data_list = self._load()

    def _save(self) -> None:
        data_json = json.dumps([asdict(item) for item in self._data_list])
        with open(self._filename, 'w') as f:
            f.write(data_json)

    def _load(self) -> List[Any]:
        if not os.path.exists(self._filename):
            return []
        with open(self._filename, 'r') as f:
            return [self._data_class(**item) for item in json.loads(f.read())]

    def select(self, unique_value: Any) -> Optional[Any]:
        return next((item for item in self._data_list if getattr(item, self._unique_key) == unique_value), None)

    def update(self, updated_instance: Any) -> bool:
        if not self.exists(getattr(updated_instance, self._unique_key)):
            return False
        for i, item in enumerate(self._data_list):
            if getattr(item, self._unique_key) == getattr(updated_instance, self._unique_key):
                self._data_list[i] = updated_instance
                self._save()
                return True
        return False

    def delete(self, unique_value: Any) -> bool:
        if not self.exists(unique_value):
            return False
        initial_length = len(self._data_list)
        self._data_list = [item for item in self._data_list if getattr(item, self._unique_key) != unique_value]
        if initial_length != len(self._data_list):
            self._save()
            return True
        return False

    def add(self, instance: Any) -> bool:
        if self.exists(getattr(instance, self._unique_key)):
            return False
        self._data_list.append(instance)
        self._save()
        return True

    def get_all(self) -> List[Any]:
        return self._data_list[:]

    def filter_by(self, **criteria) -> List[Any]:
        filtered = self._data_list[:]
        for key, value in criteria.items():
            filtered = [item for item in filtered if getattr(item, key, None) == value]
        return filtered

    def count(self) -> int:
        return len(self._data_list)

    def exists(self, value: Any) -> bool:
        return bool(self.select(value))
    
    def clear(self) -> None:
        self._data_list = []
        self._save()
