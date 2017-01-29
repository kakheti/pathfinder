# -*- encoding : utf-8 -*-
module Mongoid
  module Persistable
    module Savable
      def save(options={})
        user=options.delete(:user)
        if user
          self.created_by=user.id if new_record?
          self.updated_by=user.id
        end
        # standard implementation
        if new_record?
          !insert(options).new_record?
        else
          update_document(options)
        end
      end
    end

    module Updatable
      def update_attributes(attributes={})
        user=attributes.delete(:user)
        assign_attributes(attributes)
        save(user:user)
      end
    end
  end
end

Rails.application.config.active_record.belongs_to_required_by_default = false
Mongoid::Config.belongs_to_required_by_default = false