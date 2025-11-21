import pytest

from date import get_date_obj
from task_manager import TaskManager

@pytest.fixture
def tm():
    """A task manager that will be available to all test fnctions"""
    task_manager = TaskManager('test_file.json')
    return task_manager

def test_add_task_with_name(tm):
    """Test that a single task will be created and stored properly"""
    name = 'Wash clothes'
    tm.add_task(name)
        
    # Check if dict is in tasks
    target_task = {'name': name, 'description': '', 'due_date': ''}
    all_tasks = tm.get_all_task_dicts()

    assert target_task in all_tasks

def test_add_task_with_name_desc(tm):
    """Test that a single task will be created and stored properly"""
    name = 'Wash clothes'
    description = 'Wash before work'
    tm.add_task(name, description)
        
    # Check if dict is in tasks
    target_task = {'name': name, 'description': description, 'due_date': ''}
    all_tasks = tm.get_all_task_dicts()

    assert target_task in all_tasks

def test_add_task_with_name_desc_duedate(tm):
    """Test that a single task will be created and stored properly"""
    name = 'Wash clothes'
    description = 'Wash before work'
    due_date_str = '12/24/2025'
    
    tm.add_task(name, description, due_date_str)
    
    # Check if dict is in tasks
    due_date_object = get_date_obj(due_date_str)    # bc dates are saved as objects
    date_formatted = due_date_object.isoformat()    # then when returend are formatted
    target_task = {'name': name, 'description': description, 'due_date': date_formatted}
    all_tasks = tm.get_all_task_dicts()

    assert target_task in all_tasks

