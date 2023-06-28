class FileTrain:
  def __init__(self, fixed_model_name="default_model", domain=None, config=None, training_files=[]):
    self.fixed_model_name = fixed_model_name
    self.domain = domain
    self.config = config
    self.training_files = training_files
