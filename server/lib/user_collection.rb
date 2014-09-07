require 'securerandom'

class UserCollection
  
  ID_MAX = 1000000

  def initialize
    @users = {}
  end

  def generate_id
    id = SecureRandom.random_number(ID_MAX)
    i = 0
    until not @users.has_key? id or i >= ID_MAX
      id = (id + 1) % ID_MAX
    end
    id
  end

  def create data
    i = generate_id
    data['id'] = i
    @users[i] = data
  end

  def exist? i
    @users.has_key? i
  end

  def [] i
    @users[i]
  end

  def list
    @users
  end
end
