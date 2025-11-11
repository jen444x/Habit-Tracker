from task import Task

def test_instantiation_with_only_name_provided():
    """Test that objects are instantiated correctly when only task name is provided"""
    task_name = 'Task1'
    task = Task(task_name)
    
    # Get values
    task_dict = task.__dict__
    correct_dict = {'name': task_name, 'description': '', 'due_date': ''}
    
    # compare
    assert task_dict == correct_dict
    
def test_instantiation_with_only_name_description_provided():
    """Test that objects are instantiated correctly when only task name is provided"""
    task_name = 'Task1'
    task_desc = 'Complete Task1'
    task = Task(task_name, task_desc)
    
    # Get values
    task_dict = task.__dict__
    correct_dict = {'name': task_name, 'description': task_desc, 'due_date': ''}
    
    # compare
    assert task_dict == correct_dict