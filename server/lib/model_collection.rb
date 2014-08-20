class ModelCollection
  
  LARGE_BASE_RADIUS = 9.842
  MEDIUM_BASE_RADIUS = 7.874
  SMALL_BASE_RADIUS = 5.905

  def initialize
    @models = []
    20.times do |i|
      @models << {
        img: {
          width: 60,
          height: 60,
          x: 0.2,
          y: -0.2,
          r: LARGE_BASE_RADIUS,
          link: 'data/cygnar/jacks/Hammersmith.png'
        },
        state: {
          id: 3*i+0,
          x: 200,
          y: 20+20*i,
          rot: 0,
          active: false
        }
      }
      @models << {
        img: {
          width: 60,
          height: 60,
          x: 0.2,
          y: -0.2,
          r: MEDIUM_BASE_RADIUS,
          link: 'data/cygnar/jacks/Grenadier.png'
        },
        state: {
          id: 3*i+1,
          x: 240,
          y: 20+20*i,
          rot: 0,
          active: false
        }
      }
      @models << {
        img: {
          width: 60,
          height: 60,
          x: 0.2,
          y: -0.5,
          r: SMALL_BASE_RADIUS,
          link: 'data/cygnar/jacks/Stormwall_Pod.png'
        },
        state: {
          id: 3*i+2,
          x: 280,
          y: 20+20*i,
          rot: 0,
          active: false
        }
      }
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
