class ModelCollection
  
  LARGE_BASE_RADIUS = 9.842
  MEDIUM_BASE_RADIUS = 7.874
  SMALL_BASE_RADIUS = 5.905

  def initialize data
    if not data
      @models = []
    else
      @models = data
    end
    @connections = []
  end

  # def exist? i
  #   i = i.to_i
  #   i >=0 and i < @models.length
  # end

  # def []= i, data
  #   @models[i][:state] = data
  #   @models[i][:state]['id'] = i
  #   signalConnections i
  # end

  # def connections
  #   @connections.reject!(&:closed?)
  #   @connections
  # end

  # def addConnection out
  #   connections << out
  # end

  # def removeConnection out
  #   connections.delete(out)
  # end

  # def closeAllConnections
  #   connections.each do |out|
  #     out.close
  #   end
  #   @connections = []
  # end

  # def signalConnections i
  #   data = @models[i][:state].to_json
  #   connections.each do |out|
  #     out << "retry:100\ndata:#{data}\n\n"
  #     # out.close
  #   end
  # end

  def to_json
    @models.to_json
  end
end
