# -*- encoding : utf-8 -*-
class String
  def likefy
    self.gsub('*', '%')
  end

  def mongonize
    /^#{self.gsub('*', '.*')}$/i
  end
end
