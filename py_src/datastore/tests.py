import os
import unittest
from typing import Optional

from datastore import DataStore
from dataclasses import dataclass


@dataclass
class User:
    id: int
    name: str
    age: Optional[int] = None


@dataclass
class Book:
    title: str
    author: str
    publication_year: int


class TestDataStore(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.filename = 'temp_datastore.json'


    @classmethod
    def tearDownClass(cls):
        if os.path.exists(cls.filename):
            os.remove(cls.filename)


    def setUp(self):
        self.data_store = DataStore(User, self.filename, 'id')
    

    def tearDown(self):
        if os.path.exists(self.filename):
            os.remove(self.filename)


    def test_add(self):
        user1 = User(id=1, name="John", age=25)
        user2 = User(id=2, name="Jane", age=30)
        book1 = Book(title="The 1", author="John", publication_year=2000)
        book2 = Book(title="The 2", author="Jane", publication_year=2001)

        result1 = self.data_store.add(user1)
        result2 = self.data_store.add(user2)
        with self.assertRaises(AttributeError) as context1:
            self.data_store.add(book1)
        with self.assertRaises(AttributeError) as context2:   
            self.data_store.add(book2)

        self.assertTrue(result1)
        self.assertTrue(result2)
        self.assertEqual(str(context1.exception), "'Book' object has no attribute 'id'")
        self.assertEqual(str(context2.exception), "'Book' object has no attribute 'id'")

        self.assertEqual(self.data_store.count(), 2)


    def test_select(self):
        user1 = User(id=1, name="John", age=25)
        user2 = User(id=2, name="Jane", age=30)
        self.data_store.add(user1)
        self.data_store.add(user2)

        selected_user1 = self.data_store.select(1)
        selected_user2 = self.data_store.select(2)
        selected_user3 = self.data_store.select(3)

        self.assertEqual(selected_user1, user1)
        self.assertEqual(selected_user2, user2)
        self.assertEqual(selected_user3, None)


    def test_update(self):
        user1 = User(id=1, name="John", age=25)
        user2 = User(id=2, name="Jane", age=30)
        book1 = Book(title="The 1", author="John", publication_year=2000)
        book2 = Book(title="The 2", author="Jane", publication_year=2001)

        self.data_store.add(user1)
        self.data_store.add(user2)

        result1 = self.data_store.update(User(id=1, name="Doe", age=30))
        result2 = self.data_store.update(User(id=2, name="John", age=36))
        result3 = self.data_store.update(User(id=3, name="John", age=36))

        with self.assertRaises(AttributeError) as context1:
            self.data_store.update(book1)
        with self.assertRaises(AttributeError) as context2:
            self.data_store.update(book2)
        
        self.assertTrue(result1)
        self.assertTrue(result2)
        self.assertFalse(result3)
        self.assertEqual(str(context1.exception), "'Book' object has no attribute 'id'")
        self.assertEqual(str(context2.exception), "'Book' object has no attribute 'id'")


    def test_delete(self):
        user1 = User(id=1, name="John", age=25)
        user2 = User(id=2, name="Jane", age=30)

        self.data_store.add(user1)
        self.data_store.add(user2)

        result1 = self.data_store.delete(1)

        self.assertTrue(result1)
        self.assertEqual(self.data_store.count(), 1)

        result2 = self.data_store.delete(2)

        self.assertTrue(result2)
        self.assertEqual(self.data_store.count(), 0)


    def test_filter_by(self):
        user1 = User(id=1, name="John", age=25)
        user2 = User(id=2, name="Jane", age=30)
        user3 = User(id=3, name="John", age=35)

        self.data_store.add(user1)
        self.data_store.add(user2)
        self.data_store.add(user3)

        filtered = self.data_store.filter_by(name="John")

        self.assertEqual(len(filtered), 2)
        self.assertIn(user1, filtered)
        self.assertIn(user3, filtered)


    def test_clear(self):
        user1 = User(id=1, name="John", age=25)
        user2 = User(id=2, name="Jane", age=30)

        self.data_store.add(user1)
        self.data_store.add(user2)

        self.data_store.clear()

        self.assertEqual(self.data_store.count(), 0)


    def test_exists(self):
        user = User(id=1, name="John", age=25)

        self.data_store.add(user)
        
        self.assertTrue(self.data_store.exists(1))
        self.assertFalse(self.data_store.exists(2))
    

    def test_get_all(self):
        user1 = User(id=1, name="John", age=25)
        user2 = User(id=2, name="Jane", age=30)

        self.data_store.add(user1)
        self.data_store.add(user2)

        result = self.data_store.get_all()
        
        self.assertEqual(len(result), 2)
        self.assertIn(user1, result)
        self.assertIn(user2, result)


if __name__ == '__main__':
    unittest.main()
