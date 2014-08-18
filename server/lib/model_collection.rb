class ModelCollection
  
  def initialize
    @models = [
               {
                 id: 0,
                 x: 50,
                 y: 10,
                 rot: 30,
                 active: false
               },
               {
                 id: 1,
                 x: 270,
                 y: 210,
                 rot: 0,
                 active: false
               },
               {
                 id: 2,
                 x: 390,
                 y: 310,
                 rot: -30,
                 active: false
               }
              ]
    @connections = []
  end

  def exists? i
    i = i.to_i
    i >=0 and i < @models.length
  end

  def []= i, data
    @models[i] = data
    @models[i]['id'] = i
    signalConnections i
  end

  def all
    @models
  end

  def connections
    @connections.reject!(&:closed?)
    @connections
  end

  def addConnection out
    connections << out
  end

  def removeConnection out
    connections.delete(out)
  end

  def closeAllConnections
    connections.each do |out|
      out.close
    end
    @connections = []
  end

  def signalConnections i
    data = @models[i].to_json
    connections.each do |out|
      out << "retry:100\ndata:#{data}\n\n"
      # out.close
    end
  end
end
