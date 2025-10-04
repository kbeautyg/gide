class ToursController < ApplicationController
  skip_before_action :authenticate_user!, only: [:catalog, :show]

  def index
    @tours = current_user.tours.order(created_at: :desc)
  end

  def catalog
    @tours = Tour.active.includes(:reviews).page(params[:page])
    render layout: 'public'
  end

  def show
    @tour = Tour.find(params[:id])
    @tour.increment_views!
  end

  def new
    @tour = Tour.new
  end

  def create
    @tour = current_user.tours.build(tour_params)

    if @tour.save
      redirect_to @tour, notice: 'Экскурсия успешно создана'
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def tour_params
    params.require(:tour).permit(:title, :description, :price, :duration_hours, :city, :category, :max_participants)
  end
end

