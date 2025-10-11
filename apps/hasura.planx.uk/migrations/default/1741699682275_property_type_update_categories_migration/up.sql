-- migration for both analytics_logs and lowcal_sessions tables
with changes as ( select  allow_list_answers -> 'property.type' ->> 0 as current_pt,
case allow_list_answers -> 'property.type' ->> 0 
when 'commercial.abattoir' then	'commercial.industrial.abattoir'
when 'commercial.ancilliary' then	'commercial'
when 'commercial.community.CCTV' then	'commercial.utility.CCTV'
when 'commercial.community.cemetary' then	'commercial.community.cemetery'
when 'commercial.community.cemetary.cemetary' then 	'commercial.community.cemetery.cemetery'
when 'commercial.community.cemetary.chapelOfRest' then	'commercial.community.cemetery.chapelOfRest'
when 'commercial.community.cemetary.columbarium' then	'commercial.community.cemetery.columbarium'
when 'commercial.community.cemetary.columbarium' then	'commercial.community.cemetery.columbarium'
when 'commercial.community.cemetary.crematorium'	then 'commercial.community.cemetery.crematorium'
when 'commercial.community.cemetary.military' then 	'commercial.community.cemetery.military'
when 'commercial.education.secondarySchool' then	'commercial.education.school.secondary'
when 'commercial.education.secondarySchool.private' then	'commercial.education.school.secondary.private'
when 'commercial.education.secondarySchool.state' then	'commercial.education.school.secondary.state'
when 'commercial.fish.processing' then	'commercial.industrial.fishProcessing'
when 'commercial.horticulture' then	'commercial.agriculture.horticulture'
when 'commercial.horticulture.smallholding' then	'land.smallholding'
when 'commercial.horticulture.vineyard' then	'commercial.agriculture.horticulture.vineyard'
when 'commercial.horticulture.watercress' then	'commercial.agriculture.horticulture.watercress'
when 'commercial.industrial.distribution' then	'commercial.storage.distribution'
when 'commercial.industrial.distribution.solidFueld' then	'commercial.storage.distribution.solidFuel'
when 'commercial.industrial.distribution.timber' then	'commercial.storage.distribution.timber'
when 'commercial.industrial.light.storage' then	'commercial.storage'
when 'commercial.industrial.light.storage.crops' then	'commercial.storage.crops'
when 'commercial.industrial.light.storage.solidFuel' then	'commercial.storage.solidFuel'
when 'commercial.industrial.light.storage.timber' then	'commercial.storage.timber'
when 'commercial.information' then	'other.information'
when 'commercial.information.advertising' then	'other.information.advertising'
when 'commercial.information.tourist.sign' then	'other.information.touristSign'
when 'commercial.information.tourist.visitor' then	'commercial.retail.visitorInformation'
when 'commercial.information.traffic.sign' then	'other.information.trafficSign'
when 'commercial.leisure.sport.historicVehicles' then	'commercial.leisure.museum.historicVehicles'
when 'commercial.medical.care.home' then	'commercial.medical.careHome'
when 'commercial.medical.care.hospital' then	'commercial.medical.hospital'
when 'commercial.retail.atm' then	'commercial.utility.atm'
when 'commercial.storageLand' then	'commercial.storage.land'
when 'commercial.storageLand.building' then	'commercial.industrial.buildersYard'
when 'commercial.storageLand.general' then	'commercial.storage.land.general'
when 'commercial.transport.bus' then	'commercial.transport.road.bus'
when 'commercial.transport.dock' then	'commercial.transport.water.dock'
when 'commercial.transport.dock.ferry.passengers' then	'commercial.transport.water.dock.ferry.passengers'
when 'commercial.transport.dock.ferry.vehicles' then	'commercial.transport.water.dock.ferry.vehicles'
when 'commercial.transport.dock.generalBerth' then	'commercial.transport.water.dock.generalBerth'
when 'commercial.transport.dock.refuelling' then	'commercial.transport.water.dock.refuelling'
when 'commercial.transport.dock.slipway' then	'commercial.transport.water.dock.slipway'
when 'commercial.transport.dock.slipway' then	'commercial.transport.water.dock.passenger'
when 'commercial.transport.dock.tankerBerth' then	'commercial.transport.water.dock.tankerBerth'
when 'commercial.transport.infrastructure.aqueduct' then	'commercial.transport.water.infrastructure.aqueduct'
when 'commercial.transport.infrastructure.lock' then	'commercial.transport.water.infrastructure.lock'
when 'commercial.transport.infrastructure.weighing' then	'commercial.transport.road.infrastructure.weighing'
when 'commercial.transport.infrastructure.weir' then	'commercial.transport.water.infrastructure.weir'
when 'commercial.transport.marina' then	'commercial.transport.water.marina'
when 'commercial.transport.mooring' then	'commercial.transport.water.mooring'
when 'commercial.transport.overnightLorryPark' then	'commercial.transport.road.overnightLorryPark'
when 'commercial.transport.parking' then	'commercial.transport.road.parking'
when 'commercial.transport.parking.car' then	'commercial.transport.road.parking.car'
when 'commercial.transport.parking.coach' then	'commercial.transport.road.parking.coach'
when 'commercial.transport.parking.commercialVehicle' then	'commercial.transport.road.parking.commercialVehicle'
when 'commercial.transport.parking.parkAndRide' then	'commercial.transport.road.parking.parkAndRide'
when 'commercial.transport.railAsset' then	'commercial.transport.rail.railAsset'
when 'commercial.transport.storage' then	'commercial.storage.transport'
when 'commercial.transport.storage.boat' then	'commercial.storage.transport.boat'
when 'commercial.transport.storage.bus' then	'commercial.storage.transport.bus'
when 'commercial.transport.terminal.bus' then	'commercial.transport.road.terminal.bus'
when 'commercial.transport.terminal.train' then	'commercial.transport.rail.terminal'
when 'commercial.transport.terminal.vehicularRail' then	'commercial.transport.rail.terminal'
when 'commercial.transport.track' then	'commercial.transport.rail.track'
when 'commercial.transport.track.cliff' then	'commercial.transport.rail.track'
when 'commercial.transport.track.monorail' then	'commercial.transport.rail.monorail'
when 'land.agriculture' then	'commercial.agriculture.land'
when 'land.agriculture.crops' then	'commercial.agriculture.land.crops'
when 'land.agriculture.grazing' then	'commercial.agriculture.land.grazing'
when 'land.agriculture.orchard' then	'commercial.agriculture.land.orchard'
when 'land.building' then	'other.ancillary'
when 'land.building.aviary' then	'other.ancillary.aviary'
when 'land.building.bandstand' then	'other.ancillary.bandstand'
when 'land.building.pavilion' then	'other.ancillary.pavilion'
when 'land.building.sportsViewing' then	'other.ancillary.sportsViewing'
when 'residential.dwelling' then	'residential'
when 'residential.dwelling.boat' then	'residential.boat'
when 'residential.dwelling.caravan' then	'residential.caravan'
when 'residential.dwelling.flat' then	'residential.flat'
when 'residential.dwelling.flat.multiple' then	'residential.multiple'
when 'residential.dwelling.holiday' then	'residential.holiday'
when 'residential.dwelling.house' then	'residential.house'
when 'residential.dwelling.house.detached' then	'residential.house.detached'
when 'residential.dwelling.house.multiple' then	'residential.multiple'
when 'residential.dwelling.house.semiDetached' then	'residential.house.semiDetached'
when 'residential.dwelling.house.terrace' then	'residential.house.terrace'
when 'residential.dwelling.house.terrace.end' then	'residential.house.terrace.end'
when 'residential.dwelling.house.terrace.mid' then	'residential.house.terrace.mid'
when 'residential.dwelling.liveWork' then	'residential.liveWork'
when 'residential.dwelling.shelteredAccommodation' then	'residential.shelteredAccommodation'
when 'residential.HMO.student' then	'residential.student'
end as new_type, allow_list_answers, id
from analytics_logs
where allow_list_answers is not null and 
allow_list_answers -> 'property.type' ->> 0 in 
('commercial.abattoir','commercial.ancilliary','commercial.community.CCTV','commercial.community.cemetary',
'commercial.community.cemetary.cemetary','commercial.community.cemetary.chapelOfRest','commercial.community.cemetary.columbarium',
'commercial.community.cemetary.columbarium','commercial.community.cemetary.crematorium','commercial.community.cemetary.military',
'commercial.education.secondarySchool','commercial.education.secondarySchool.private','commercial.education.secondarySchool.state',
'commercial.fish.processing','commercial.horticulture','commercial.horticulture.smallholding','commercial.horticulture.vineyard',
'commercial.horticulture.watercress','commercial.industrial.distribution','commercial.industrial.distribution.solidFueld',
'commercial.industrial.distribution.timber','commercial.industrial.light.storage','commercial.industrial.light.storage.crops',
'commercial.industrial.light.storage.solidFuel','commercial.industrial.light.storage.timber','commercial.information',
'commercial.information.advertising','commercial.information.tourist.sign','commercial.information.tourist.visitor',
'commercial.information.traffic.sign','commercial.leisure.sport.historicVehicles','commercial.medical.care.home',
'commercial.medical.care.hospital','commercial.retail.atm','commercial.storageLand','commercial.storageLand.building',
'commercial.storageLand.general','commercial.transport.bus','commercial.transport.dock','commercial.transport.dock.ferry.passengers',
'commercial.transport.dock.ferry.vehicles','commercial.transport.dock.generalBerth','commercial.transport.dock.refuelling',
'commercial.transport.dock.slipway','commercial.transport.dock.slipway','commercial.transport.dock.tankerBerth',
'commercial.transport.infrastructure.aqueduct','commercial.transport.infrastructure.lock','commercial.transport.infrastructure.weighing',
'commercial.transport.infrastructure.weir','commercial.transport.marina','commercial.transport.mooring',
'commercial.transport.overnightLorryPark','commercial.transport.parking','commercial.transport.parking.car',
'commercial.transport.parking.coach','commercial.transport.parking.commercialVehicle','commercial.transport.parking.parkAndRide',
'commercial.transport.railAsset','commercial.transport.storage','commercial.transport.storage.boat','commercial.transport.storage.bus',
'commercial.transport.terminal.bus','commercial.transport.terminal.train','commercial.transport.terminal.vehicularRail',
'commercial.transport.track','commercial.transport.track.cliff','commercial.transport.track.monorail','land.agriculture',
'land.agriculture.crops','land.agriculture.grazing','land.agriculture.orchard','land.building','land.building.aviary',
'land.building.bandstand','land.building.pavilion','land.building.sportsViewing','residential.dwelling','residential.dwelling.boat',
'residential.dwelling.caravan','residential.dwelling.flat','residential.dwelling.flat.multiple','residential.dwelling.holiday',
'residential.dwelling.house','residential.dwelling.house.detached','residential.dwelling.house.multiple',
'residential.dwelling.house.semiDetached','residential.dwelling.house.terrace','residential.dwelling.house.terrace.end'
'residential.dwelling.house.terrace.mid','residential.dwelling.liveWork','residential.dwelling.shelteredAccommodation',
'residential.HMO.student')
) 
UPDATE analytics_logs SET allow_list_answers = JSONB_SET(c.allow_list_answers, '{property.type,0}', to_jsonb(c.new_type))
  FROM changes AS c
  WHERE analytics_logs.id = c.id;

with changes as ( select  allow_list_answers -> 'property.type' ->> 0 as current_pt,
case allow_list_answers -> 'property.type' ->> 0 
when 'commercial.abattoir' then	'commercial.industrial.abattoir'
when 'commercial.ancilliary' then	'commercial'
when 'commercial.community.CCTV' then	'commercial.utility.CCTV'
when 'commercial.community.cemetary' then	'commercial.community.cemetery'
when 'commercial.community.cemetary.cemetary' then 	'commercial.community.cemetery.cemetery'
when 'commercial.community.cemetary.chapelOfRest' then	'commercial.community.cemetery.chapelOfRest'
when 'commercial.community.cemetary.columbarium' then	'commercial.community.cemetery.columbarium'
when 'commercial.community.cemetary.columbarium' then	'commercial.community.cemetery.columbarium'
when 'commercial.community.cemetary.crematorium'	then 'commercial.community.cemetery.crematorium'
when 'commercial.community.cemetary.military' then 	'commercial.community.cemetery.military'
when 'commercial.education.secondarySchool' then	'commercial.education.school.secondary'
when 'commercial.education.secondarySchool.private' then	'commercial.education.school.secondary.private'
when 'commercial.education.secondarySchool.state' then	'commercial.education.school.secondary.state'
when 'commercial.fish.processing' then	'commercial.industrial.fishProcessing'
when 'commercial.horticulture' then	'commercial.agriculture.horticulture'
when 'commercial.horticulture.smallholding' then	'land.smallholding'
when 'commercial.horticulture.vineyard' then	'commercial.agriculture.horticulture.vineyard'
when 'commercial.horticulture.watercress' then	'commercial.agriculture.horticulture.watercress'
when 'commercial.industrial.distribution' then	'commercial.storage.distribution'
when 'commercial.industrial.distribution.solidFueld' then	'commercial.storage.distribution.solidFuel'
when 'commercial.industrial.distribution.timber' then	'commercial.storage.distribution.timber'
when 'commercial.industrial.light.storage' then	'commercial.storage'
when 'commercial.industrial.light.storage.crops' then	'commercial.storage.crops'
when 'commercial.industrial.light.storage.solidFuel' then	'commercial.storage.solidFuel'
when 'commercial.industrial.light.storage.timber' then	'commercial.storage.timber'
when 'commercial.information' then	'other.information'
when 'commercial.information.advertising' then	'other.information.advertising'
when 'commercial.information.tourist.sign' then	'other.information.touristSign'
when 'commercial.information.tourist.visitor' then	'commercial.retail.visitorInformation'
when 'commercial.information.traffic.sign' then	'other.information.trafficSign'
when 'commercial.leisure.sport.historicVehicles' then	'commercial.leisure.museum.historicVehicles'
when 'commercial.medical.care.home' then	'commercial.medical.careHome'
when 'commercial.medical.care.hospital' then	'commercial.medical.hospital'
when 'commercial.retail.atm' then	'commercial.utility.atm'
when 'commercial.storageLand' then	'commercial.storage.land'
when 'commercial.storageLand.building' then	'commercial.industrial.buildersYard'
when 'commercial.storageLand.general' then	'commercial.storage.land.general'
when 'commercial.transport.bus' then	'commercial.transport.road.bus'
when 'commercial.transport.dock' then	'commercial.transport.water.dock'
when 'commercial.transport.dock.ferry.passengers' then	'commercial.transport.water.dock.ferry.passengers'
when 'commercial.transport.dock.ferry.vehicles' then	'commercial.transport.water.dock.ferry.vehicles'
when 'commercial.transport.dock.generalBerth' then	'commercial.transport.water.dock.generalBerth'
when 'commercial.transport.dock.refuelling' then	'commercial.transport.water.dock.refuelling'
when 'commercial.transport.dock.slipway' then	'commercial.transport.water.dock.slipway'
when 'commercial.transport.dock.slipway' then	'commercial.transport.water.dock.passenger'
when 'commercial.transport.dock.tankerBerth' then	'commercial.transport.water.dock.tankerBerth'
when 'commercial.transport.infrastructure.aqueduct' then	'commercial.transport.water.infrastructure.aqueduct'
when 'commercial.transport.infrastructure.lock' then	'commercial.transport.water.infrastructure.lock'
when 'commercial.transport.infrastructure.weighing' then	'commercial.transport.road.infrastructure.weighing'
when 'commercial.transport.infrastructure.weir' then	'commercial.transport.water.infrastructure.weir'
when 'commercial.transport.marina' then	'commercial.transport.water.marina'
when 'commercial.transport.mooring' then	'commercial.transport.water.mooring'
when 'commercial.transport.overnightLorryPark' then	'commercial.transport.road.overnightLorryPark'
when 'commercial.transport.parking' then	'commercial.transport.road.parking'
when 'commercial.transport.parking.car' then	'commercial.transport.road.parking.car'
when 'commercial.transport.parking.coach' then	'commercial.transport.road.parking.coach'
when 'commercial.transport.parking.commercialVehicle' then	'commercial.transport.road.parking.commercialVehicle'
when 'commercial.transport.parking.parkAndRide' then	'commercial.transport.road.parking.parkAndRide'
when 'commercial.transport.railAsset' then	'commercial.transport.rail.railAsset'
when 'commercial.transport.storage' then	'commercial.storage.transport'
when 'commercial.transport.storage.boat' then	'commercial.storage.transport.boat'
when 'commercial.transport.storage.bus' then	'commercial.storage.transport.bus'
when 'commercial.transport.terminal.bus' then	'commercial.transport.road.terminal.bus'
when 'commercial.transport.terminal.train' then	'commercial.transport.rail.terminal'
when 'commercial.transport.terminal.vehicularRail' then	'commercial.transport.rail.terminal'
when 'commercial.transport.track' then	'commercial.transport.rail.track'
when 'commercial.transport.track.cliff' then	'commercial.transport.rail.track'
when 'commercial.transport.track.monorail' then	'commercial.transport.rail.monorail'
when 'land.agriculture' then	'commercial.agriculture.land'
when 'land.agriculture.crops' then	'commercial.agriculture.land.crops'
when 'land.agriculture.grazing' then	'commercial.agriculture.land.grazing'
when 'land.agriculture.orchard' then	'commercial.agriculture.land.orchard'
when 'land.building' then	'other.ancillary'
when 'land.building.aviary' then	'other.ancillary.aviary'
when 'land.building.bandstand' then	'other.ancillary.bandstand'
when 'land.building.pavilion' then	'other.ancillary.pavilion'
when 'land.building.sportsViewing' then	'other.ancillary.sportsViewing'
when 'residential.dwelling' then	'residential'
when 'residential.dwelling.boat' then	'residential.boat'
when 'residential.dwelling.caravan' then	'residential.caravan'
when 'residential.dwelling.flat' then	'residential.flat'
when 'residential.dwelling.flat.multiple' then	'residential.multiple'
when 'residential.dwelling.holiday' then	'residential.holiday'
when 'residential.dwelling.house' then	'residential.house'
when 'residential.dwelling.house.detached' then	'residential.house.detached'
when 'residential.dwelling.house.multiple' then	'residential.multiple'
when 'residential.dwelling.house.semiDetached' then	'residential.house.semiDetached'
when 'residential.dwelling.house.terrace' then	'residential.house.terrace'
when 'residential.dwelling.house.terrace.end' then	'residential.house.terrace.end'
when 'residential.dwelling.house.terrace.mid' then	'residential.house.terrace.mid'
when 'residential.dwelling.liveWork' then	'residential.liveWork'
when 'residential.dwelling.shelteredAccommodation' then	'residential.shelteredAccommodation'
when 'residential.HMO.student' then	'residential.student'
end as new_type, allow_list_answers, id
from lowcal_sessions
where allow_list_answers is not null and 
allow_list_answers -> 'property.type' ->> 0 in 
('commercial.abattoir','commercial.ancilliary','commercial.community.CCTV','commercial.community.cemetary',
'commercial.community.cemetary.cemetary','commercial.community.cemetary.chapelOfRest','commercial.community.cemetary.columbarium',
'commercial.community.cemetary.columbarium','commercial.community.cemetary.crematorium','commercial.community.cemetary.military',
'commercial.education.secondarySchool','commercial.education.secondarySchool.private','commercial.education.secondarySchool.state',
'commercial.fish.processing','commercial.horticulture','commercial.horticulture.smallholding','commercial.horticulture.vineyard',
'commercial.horticulture.watercress','commercial.industrial.distribution','commercial.industrial.distribution.solidFueld',
'commercial.industrial.distribution.timber','commercial.industrial.light.storage','commercial.industrial.light.storage.crops',
'commercial.industrial.light.storage.solidFuel','commercial.industrial.light.storage.timber','commercial.information',
'commercial.information.advertising','commercial.information.tourist.sign','commercial.information.tourist.visitor',
'commercial.information.traffic.sign','commercial.leisure.sport.historicVehicles','commercial.medical.care.home',
'commercial.medical.care.hospital','commercial.retail.atm','commercial.storageLand','commercial.storageLand.building',
'commercial.storageLand.general','commercial.transport.bus','commercial.transport.dock','commercial.transport.dock.ferry.passengers',
'commercial.transport.dock.ferry.vehicles','commercial.transport.dock.generalBerth','commercial.transport.dock.refuelling',
'commercial.transport.dock.slipway','commercial.transport.dock.slipway','commercial.transport.dock.tankerBerth',
'commercial.transport.infrastructure.aqueduct','commercial.transport.infrastructure.lock','commercial.transport.infrastructure.weighing',
'commercial.transport.infrastructure.weir','commercial.transport.marina','commercial.transport.mooring',
'commercial.transport.overnightLorryPark','commercial.transport.parking','commercial.transport.parking.car',
'commercial.transport.parking.coach','commercial.transport.parking.commercialVehicle','commercial.transport.parking.parkAndRide',
'commercial.transport.railAsset','commercial.transport.storage','commercial.transport.storage.boat','commercial.transport.storage.bus',
'commercial.transport.terminal.bus','commercial.transport.terminal.train','commercial.transport.terminal.vehicularRail',
'commercial.transport.track','commercial.transport.track.cliff','commercial.transport.track.monorail','land.agriculture',
'land.agriculture.crops','land.agriculture.grazing','land.agriculture.orchard','land.building','land.building.aviary',
'land.building.bandstand','land.building.pavilion','land.building.sportsViewing','residential.dwelling','residential.dwelling.boat',
'residential.dwelling.caravan','residential.dwelling.flat','residential.dwelling.flat.multiple','residential.dwelling.holiday',
'residential.dwelling.house','residential.dwelling.house.detached','residential.dwelling.house.multiple',
'residential.dwelling.house.semiDetached','residential.dwelling.house.terrace','residential.dwelling.house.terrace.end'
'residential.dwelling.house.terrace.mid','residential.dwelling.liveWork','residential.dwelling.shelteredAccommodation',
'residential.HMO.student')
) 
UPDATE lowcal_sessions SET allow_list_answers = JSONB_SET(c.allow_list_answers, '{property.type,0}', to_jsonb(c.new_type))
  FROM changes AS c
  WHERE lowcal_sessions.id = c.id;
