module Admin
  class UsersController < ApplicationController
    before_action :ensure_super_admin

    def index
      @users = User.order(created_at: :desc).page(params[:page])
    end

    def show
      @user = User.find(params[:id])
    end

    def new
      @user = User.new
    end

    def create
      @user = User.new(user_params)

      if @user.save
        redirect_to admin_user_path(@user), notice: 'Пользователь создан'
      else
        render :new, status: :unprocessable_entity
      end
    end

    private

    def ensure_super_admin
      redirect_to root_path, alert: 'Только для супер-админа' unless current_user.super_admin?
    end

    def user_params
      params.require(:user).permit(:email, :phone, :full_name, :role, :parent_id, :password, :password_confirmation)
    end
  end
end

