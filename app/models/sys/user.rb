# -*- encoding : utf-8 -*-
module Sys
  class User
    include Mongoid::Document
    include Mongoid::Timestamps
    include Sys::Userstamps

    field :username, type: String
    field :hashed_password, type: String
    field :salt, type: String
    field :admin, type: Mongoid::Boolean, default: false
    field :active, type: Mongoid::Boolean, default: true
    field :editor, type: Mongoid::Boolean, default: false
    field :all_regions, type: Mongoid::Boolean, default: false
    field :first_name, type: String
    field :last_name, type: String
    field :mobile, type: String
    has_and_belongs_to_many :regions

    index({username: 1}, {unique: true})
    index(first_name: 1, last_name: 1)

    validates :username, uniqueness: {message: I18n.t('models.sys_user._errors.username_is_taken')}
    validates :username, username: {message: I18n.t('mode ls.sys_user._errors.illegal_username')}
    validates :password, confirmation: {message: I18n.t('models.sys_user._errors.password_not_match')}
    validates :first_name, presence: {message: I18n.t('models.sys_user._errors.empty_first_name')}
    validates :last_name, presence: {message: I18n.t('models.sys_user._errors.empty_last_name')}
    validates :mobile, mobile: {message: I18n.t('models.sys_user._errors.illegal_mobile')}
    validate :password_definition

    before_create :user_before_create
    before_save :user_before_save

    attr_accessor :password_confirmation
    attr_reader :password

    def full_name
      "#{first_name} #{last_name}"
    end

    def self.encrypt_password(password, salt)
      Digest::SHA1.hexdigest("#{password}dimitri#{salt}")
    end

    def self.generate_hash(user)
      Digest::MD5.hexdigest("#{Time.now}#{rand(20111111)/11.0}#{user.username}")
    end

    def to_s
      self.full_name
    end

    def formatted_mobile
      KA.format_mobile(self.mobile)
    end

    def admin?
      self.admin
    end

    def password=(pwd)
      @password = pwd
      return if pwd.blank?
      self.salt = "#{self.object_id}#{rand 1000}"
      self.hashed_password = User.encrypt_password(self.password, self.salt)
    end

    # Authenticate user (even inactive) using given username and password.
    def self.authenticate(username, password)
      user = User.where(username: username).first
      user = nil if user and user.hashed_password != User.encrypt_password(password, user.salt)
      user
    end

    def current_task
      Task.current_task(self)
    end

    private

    def password_definition
      if hashed_password.blank?
        errors.add(:password, I18n.t('models.sys_user._errors.empty_password'))
      end
    end

    def user_before_create
      self.admin = (User.count == 0)
      self.active = true
    end

    def user_before_save
      self.mobile = KA.compact_mobile(self.mobile)
    end
  end
end
