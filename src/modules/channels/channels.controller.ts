import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelDto, CreateChannelDto } from '../../contracts';

@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get()
  async getAllChannels(): Promise<ChannelDto[]> {
    return await this.channelsService.getChannels();
  }

  @Get('/default')
  async getDefaultChannel(): Promise<ChannelDto> {
    return await this.channelsService.getDefaultChannel();
  }

  @Get(':id')
  async getChannel(@Param('id') id: string): Promise<ChannelDto> {
    const channel = await this.channelsService.getChannelById(id);
    if (channel === null) {
      throw new NotFoundException(`Could not get channel with id: '${id}'`);
    }
    return channel;
  }

  @Post()
  async createChannel(
    @Body() createChannelDto: CreateChannelDto,
  ): Promise<ChannelDto> {
    const newChannel = await this.channelsService.createChannel(
      createChannelDto,
    );
    return newChannel;
  }
}
