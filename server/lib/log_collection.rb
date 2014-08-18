require 'securerandom'

class LogCollection
  
  ID_MAX = 1000000

  def initialize
    @logs = {}
  end

  def generate_id
    id = SecureRandom.random_number(ID_MAX).to_s
    i = 0
    until not @logs.has_key? id or i >= ID_MAX
      id = (id + 1) % ID_MAX
    end
    id
  end

  def create data
    i = generate_id
    @logs[i] = data
    @logs[i]['id'] = i
    i
  end

  def exists? i
    @logs.has_key? i
  end

  def [] i
    @logs[i]
  end

  def []= i, data
    @logs[i] = data
    @clocks[i]['id'] = i
  end

  def list
    list = {
      size: @logs.size,
      logs: []
    }
    @logs.each do |id, log|
      list[:logs] << { id: id }
    end
    list
  end

  def status
    {
      logs: @logs.length,
    }
  end
end
